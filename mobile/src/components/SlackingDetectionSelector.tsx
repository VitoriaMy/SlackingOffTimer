import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { SlackingDetectionMethod } from "_/types";
import { rs } from "@/core/responsive";

interface SlackingDetectionSelectorProps {
  value: SlackingDetectionMethod[];
  onChange: (methods: SlackingDetectionMethod[]) => void;
}

const DETECTION_METHODS: { value: SlackingDetectionMethod; label: string; description: string }[] = [
  {
    value: "gyroscope",
    label: "陀螺仪",
    description: "检测设备运动",
  },
  {
    value: "deviceStatus",
    label: "解锁状态",
    description: "检测设备是否解锁",
  },
  {
    value: "screenUsage",
    label: "屏幕使用",
    description: "检测屏幕是否在使用",
  },
];

export function SlackingDetectionSelector({ value, onChange }: SlackingDetectionSelectorProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleMethod = (method: SlackingDetectionMethod) => {
    const newMethods = value.includes(method)
      ? value.filter((m) => m !== method)
      : [...value, method];
    
    // 确保至少选择一个方法
    if (newMethods.length > 0) {
      onChange(newMethods);
    }
  };

  const selectedCount = value.length;
  const selectedText =
    selectedCount === DETECTION_METHODS.length
      ? "全部启用"
      : selectedCount === 0
        ? "未启用"
        : `已启用 ${selectedCount} 个`;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerContent}>
          <Text style={styles.label}>摸鱼检测方式</Text>
          <Text style={styles.selected}>{selectedText}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={rs(24)}
          color="#999"
        />
      </Pressable>

      {expanded && (
        <View style={styles.items}>
          {DETECTION_METHODS.map((method) => (
            <Pressable
              key={method.value}
              style={styles.item}
              onPress={() => toggleMethod(method.value)}
            >
              <View style={styles.checkbox}>
                {value.includes(method.value) && (
                  <Ionicons name="checkmark" size={rs(16)} color="#007AFF" />
                )}
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: rs(8),
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    backgroundColor: "#F9F9F9",
  },
  headerContent: {
    flex: 1,
    marginRight: rs(8),
  },
  label: {
    fontSize: rs(14),
    fontWeight: "500",
    color: "#333",
  },
  selected: {
    fontSize: rs(12),
    color: "#777",
    marginTop: rs(4),
  },
  items: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(16),
    paddingVertical: rs(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  checkbox: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(4),
    borderWidth: 2,
    borderColor: "#E5E5E5",
    marginRight: rs(12),
    justifyContent: "center",
    alignItems: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: rs(14),
    fontWeight: "500",
    color: "#333",
  },
  methodDescription: {
    fontSize: rs(12),
    color: "#999",
    marginTop: rs(4),
  },
});
