import { useState, useEffect } from "react";
import { SaveOutlined } from "@ant-design/icons";
import { notification } from "antd";
import { PageLayout } from "../common/PageLayout";
import { settingsService } from "../../services/settingsService";

import { SettingsCameraLPR } from "./Settings_CameraLPR";
import { SettingsBarrier } from "./Settings_Barrier";
import { SettingsSensors } from "./Settings_Sensors";
import { SettingsSystemNetwork } from "./Settings_SystemNetwork";

export const SettingsMain = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSystemSettings();
        setSettings(data);
      } catch (error) {
        console.error("Lỗi lấy cấu hình:", error);
        notification.error({ message: 'Không thể lấy dữ liệu cấu hình' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Hàm xử lý thay đổi state dùng chung cho các components con
  const handleChange = (section, field, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const fields = field.split('.');
      
      if (fields.length === 1) {
        newSettings[section][fields[0]] = value;
      } else if (fields.length === 2) {
        newSettings[section][fields[0]][fields[1]] = value;
      }
      
      return newSettings;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await settingsService.saveSystemSettings(settings);
      if (response.success) {
        notification.success({ 
          message: 'Lưu thành công', 
          description: 'Cấu hình hệ thống đã được cập nhật.',
          placement: 'topRight' 
        });
      }
    } catch (error) {
      notification.error({ message: 'Lỗi khi lưu cấu hình' });
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefault = () => {
    notification.info({ 
      message: 'Tính năng đang phát triển', 
      description: 'Chức năng khôi phục mặc định đang được hoàn thiện.' 
    });
  };

  if (loading) {
    return (
      <PageLayout title="Cấu hình Thiết bị & Hệ thống">
        <div className="w-full flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#1677ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Cấu hình Thiết bị & Hệ thống"
      subtitle="Quản lý tham số phần cứng, độ nhạy cảm biến và cập nhật phần mềm trạm."
      actions={
        <>
          <button 
            onClick={handleRestoreDefault}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-[#cbd5e1] dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors dark:text-slate-200 shadow-sm"
          >
            Khôi phục mặc định
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#041627] hover:bg-[#0a2744] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SaveOutlined />}
            Lưu cấu hình
          </button>
        </>
      }
    >
      <div className="grid grid-cols-12 gap-6 w-full max-w-[1200px]">
        {/* Cột trái (Chiếm 7 phần) */}
        <div className="col-span-7 flex flex-col gap-6">
          <SettingsCameraLPR data={settings?.camera} onChange={handleChange} />
          <SettingsSensors data={settings?.sensors} onChange={handleChange} />
        </div>

        {/* Cột phải (Chiếm 5 phần) */}
        <div className="col-span-5 flex flex-col gap-6">
          <SettingsBarrier data={settings?.barrier} onChange={handleChange} />
          <SettingsSystemNetwork data={settings} onChange={handleChange} />
        </div>
      </div>
    </PageLayout>
  );
};
