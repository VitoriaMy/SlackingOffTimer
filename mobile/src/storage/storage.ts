import { AppLanguage, ScheduleHistoryRecord, SlackingRecord, WorkSchedule } from "@/src/core/types";

export interface AppStorage {
  loadSchedule(): Promise<WorkSchedule>;
  saveSchedule(schedule: WorkSchedule): Promise<void>;
  loadConfigured(): Promise<boolean>;
  saveConfigured(configured: boolean): Promise<void>;
  loadLanguage(): Promise<AppLanguage>;
  saveLanguage(language: AppLanguage): Promise<void>;
  loadSlackingRecords(): Promise<SlackingRecord[]>;
  saveSlackingRecords(records: SlackingRecord[]): Promise<void>;
  loadScheduleHistory(): Promise<ScheduleHistoryRecord[]>;
  saveScheduleHistory(records: ScheduleHistoryRecord[]): Promise<void>;
}
