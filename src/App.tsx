import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  AiFillHome,
  AiFillSetting,
  AiOutlineLeft,
  AiOutlineFund,
  AiOutlineHome,
  AiOutlineLineChart,
  AiOutlineSetting
} from "react-icons/ai";
import {
  loadConfigured,
  loadLanguage,
  loadSchedule,
  loadSessionState,
  loadStats,
  saveConfigured,
  saveLanguage,
  saveSessionState,
  saveSchedule,
  upsertTodayStat
} from "../lib/storage";
import { computeRatio, getEffectiveWorkMinutes, isWorkWindow } from "../lib/time";
import { AppLanguage, DailyStat, WorkSchedule, defaultSchedule } from "../lib/types";
import { TEXT } from "./i18n";
import { dateKey, getWorkSegmentId, normalizeSchedule } from "./schedule";
import { TodayPage } from "./pages/TodayPage";
import { TrendsPage } from "./pages/TrendsPage";
import {
  HolidaySettingsPage,
  LanguageSettingsPage,
  SettingsHubPage,
  WorkDaysSettingsPage,
  WorkTimeSettingsPage
} from "./pages/settings";

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>("zh");
  const [configured, setConfigured] = useState(false);
  const [schedule, setSchedule] = useState<WorkSchedule>(defaultSchedule);
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [sessionStatus, setSessionStatus] = useState<0 | 1>(0);
  const [sessionStartAt, setSessionStartAt] = useState<number | null>(null);
  const activeSegmentRef = useRef<string | null>(null);

  useEffect(() => {
    const savedSchedule = normalizeSchedule(loadSchedule());
    setSchedule(savedSchedule);
    setStats(loadStats());
    setConfigured(loadConfigured());
    setLanguage(loadLanguage());

    const savedSession = loadSessionState();
    if (savedSession.status === 1 && savedSession.startAt && savedSession.segmentId) {
      const currentSegment = getWorkSegmentId(new Date(), savedSchedule);
      if (currentSegment && currentSegment === savedSession.segmentId) {
        setSessionStatus(1);
        setSessionStartAt(savedSession.startAt);
        activeSegmentRef.current = savedSession.segmentId;
      } else {
        saveSessionState({ status: 0, startAt: null, endAt: null, segmentId: null });
      }
    }

    setReady(true);
  }, []);

  const text = TEXT[language];

  useEffect(() => {
    document.title = text.appTitle;
  }, [text.appTitle]);

  const today = dateKey(new Date());
  const effectiveWorkMinutes = getEffectiveWorkMinutes(schedule);
  const todayStat = stats.find((item) => item.date === today) ?? {
    date: today,
    fishMinutes: 0,
    workMinutes: effectiveWorkMinutes
  };

  const canTrackNow = isWorkWindow(new Date(), schedule);
  const isTracking = sessionStatus === 1 && sessionStartAt !== null;

  const commitSession = useCallback(
    (startAt: number, endAt: number) => {
      if (endAt <= startAt) return;
      const startDate = new Date(startAt);
      const date = dateKey(startDate);
      const allStats = loadStats();
      const existing = allStats.find((item) => item.date === date) ?? {
        date,
        fishMinutes: 0,
        workMinutes: effectiveWorkMinutes
      };
      const durationMinutes = Math.max(1, Math.round((endAt - startAt) / 60000));
      const updated = upsertTodayStat({
        ...existing,
        fishMinutes: existing.fishMinutes + durationMinutes,
        workMinutes: effectiveWorkMinutes
      });
      setStats(updated);
    },
    [effectiveWorkMinutes]
  );

  const closeSession = useCallback(
    (endAt: number) => {
      if (sessionStartAt === null) return;
      commitSession(sessionStartAt, endAt);
      setSessionStartAt(null);
      activeSegmentRef.current = null;
      saveSessionState({ status: 0, startAt: null, endAt, segmentId: null });
    },
    [commitSession, sessionStartAt]
  );

  const handleStatusUpdate = useCallback(
    (nextStatus: 0 | 1) => {
      if (nextStatus === 1) {
        const now = new Date();
        const segmentId = getWorkSegmentId(now, schedule);
        if (!segmentId || sessionStartAt !== null) return;
        const startAt = now.getTime();
        setSessionStatus(1);
        setSessionStartAt(startAt);
        activeSegmentRef.current = segmentId;
        saveSessionState({ status: 1, startAt, endAt: null, segmentId });
        return;
      }

      if (sessionStartAt !== null) {
        closeSession(Date.now());
      }
      setSessionStatus(0);
      saveSessionState({ status: 0, startAt: null, endAt: Date.now(), segmentId: null });
    },
    [closeSession, schedule, sessionStartAt]
  );

  useEffect(() => {
    const handleBlur = () => handleStatusUpdate(0);
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [handleStatusUpdate]);

  useEffect(() => {
    if (sessionStatus !== 1) return;
    const timer = window.setInterval(() => {
      const now = new Date();
      const segmentId = getWorkSegmentId(now, schedule);
      if (!segmentId || segmentId !== activeSegmentRef.current) {
        handleStatusUpdate(0);
      }
    }, 15000);
    return () => window.clearInterval(timer);
  }, [handleStatusUpdate, schedule, sessionStatus]);

  useEffect(() => {
    if (sessionStatus !== 1) return;
    const segmentId = getWorkSegmentId(new Date(), schedule);
    if (!segmentId || segmentId !== activeSegmentRef.current) {
      handleStatusUpdate(0);
    }
  }, [handleStatusUpdate, schedule, sessionStatus]);

  const handleSaveSchedule = (next: WorkSchedule, redirectTo: string = "/settings") => {
    const normalized = normalizeSchedule(next);
    saveSchedule(normalized);
    saveConfigured(true);
    setSchedule(normalized);
    setConfigured(true);
    window.alert(text.alertSaved);
    navigate(redirectTo);
  };

  const handleSaveScheduleSilently = (next: WorkSchedule) => {
    const normalized = normalizeSchedule(next);
    saveSchedule(normalized);
    saveConfigured(true);
    setSchedule(normalized);
    setConfigured(true);
  };

  const handleLanguageSave = (next: AppLanguage) => {
    setLanguage(next);
    saveLanguage(next);
    navigate("/settings");
  };

  const isHomePage = location.pathname === "/";
  const isSettingsPage = location.pathname.startsWith("/settings");
  const primaryPagePaths = new Set(["/", "/trends", "/settings"]);
  const showBackButton = !primaryPagePaths.has(location.pathname);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  const headerTitle = isHomePage
    ? text.appTitle
    : location.pathname === "/trends"
      ? text.sevenDaysTitle
      : location.pathname === "/settings/language"
        ? text.sectionLanguage
        : location.pathname === "/settings/work-time"
          ? text.sectionWorkTime
          : location.pathname === "/settings/work-days"
            ? text.sectionWorkDays
            : location.pathname === "/settings/holiday"
              ? text.sectionHoliday
              : isSettingsPage
                ? text.settings
                : text.appTitle;

  const statusText = !canTrackNow ? text.offWork : isTracking ? text.tracking : text.standby;
  const ratio = computeRatio(todayStat.fishMinutes, effectiveWorkMinutes);

  if (!ready) {
    return <main className="container">{text.loading}</main>;
  }

  return (
    <main className="container app-shell">
      <header className="header">
        <div className="header-top">
          {showBackButton ? (
            <button type="button" className="icon-back" onClick={handleGoBack} aria-label="返回">
              <AiOutlineLeft />
            </button>
          ) : (
            <span className="header-side-placeholder" aria-hidden="true" />
          )}
          <h1>{headerTitle}</h1>
          <span className="header-side-placeholder" aria-hidden="true" />
        </div>
      </header>

      <section className="page-content">
        <Routes>
          <Route
            path="/"
            element={
              configured ? (
                <TodayPage
                  language={language}
                  title={text.todayTitle}
                  fishDuration={text.fishDuration}
                  fishRatio={text.fishRatio}
                  statusLabel={text.status}
                  startLabel={text.startSession}
                  stopLabel={text.stopSession}
                  offWorkHint={text.notWorkHint}
                  fishMinutes={todayStat.fishMinutes}
                  ratio={ratio}
                  statusText={statusText}
                  isTracking={isTracking}
                  canTrackNow={canTrackNow}
                  onStart={() => handleStatusUpdate(1)}
                  onStop={() => handleStatusUpdate(0)}
                />
              ) : (
                <Navigate to="/settings" replace />
              )
            }
          />
          <Route path="/settings" element={<SettingsHubPage text={text} isFirstSetup={!configured} />} />
          <Route
            path="/settings/language"
            element={<LanguageSettingsPage text={text} language={language} onSaveLanguage={handleLanguageSave} />}
          />
          <Route
            path="/settings/work-time"
            element={
              <WorkTimeSettingsPage
                text={text}
                language={language}
                schedule={schedule}
                onSaveSchedule={(next) => handleSaveSchedule(next, configured ? "/settings" : "/")}
              />
            }
          />
          <Route
            path="/settings/work-days"
            element={
              <WorkDaysSettingsPage
                text={text}
                language={language}
                schedule={schedule}
                onSaveSchedule={(next) => handleSaveSchedule(next, configured ? "/settings" : "/")}
              />
            }
          />
          <Route
            path="/settings/holiday"
            element={
              <HolidaySettingsPage
                text={text}
                schedule={schedule}
                onSaveSchedule={handleSaveScheduleSilently}
              />
            }
          />
          <Route
            path="/trends"
            element={
              configured ? (
                <TrendsPage
                  language={language}
                  title={text.sevenDaysTitle}
                  noDataHint={text.noDataHint}
                  totalLabel={text.total7}
                  avgRatioLabel={text.avgRatio}
                  durationLegend={text.durationLegend}
                  ratioLegend={text.ratioLegend}
                  stats={stats}
                />
              ) : (
                <Navigate to="/settings" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </section>

      <nav className="bottom-nav" aria-label="主菜单">
        <NavLink to="/" className={({ isActive }) => (isActive ? "tab active" : "tab")}>
          {({ isActive }) => (
            <>
              <span className="tab-icon" aria-hidden="true">
                {isActive ? <AiFillHome /> : <AiOutlineHome />}
              </span>
              <span>{text.home}</span>
            </>
          )}
        </NavLink>
        <NavLink to="/trends" className={({ isActive }) => (isActive ? "tab active" : "tab")}>
          {({ isActive }) => (
            <>
              <span className="tab-icon" aria-hidden="true">
                {isActive ? <AiOutlineFund /> : <AiOutlineLineChart />}
              </span>
              <span>{text.trends}</span>
            </>
          )}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "tab active" : "tab")}>
          {({ isActive }) => (
            <>
              <span className="tab-icon" aria-hidden="true">
                {isActive ? <AiFillSetting /> : <AiOutlineSetting />}
              </span>
              <span>{text.settings}</span>
            </>
          )}
        </NavLink>
      </nav>
    </main>
  );
}
