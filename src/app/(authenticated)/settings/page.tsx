"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Moon, Sun, Monitor, Globe, Shield } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Theme, Language, PrivacyLevel } from "@/lib/enums";
import { SettingsService, UserSettings } from "@/lib/services/settings";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const { theme: currentTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    theme: Theme.SYSTEM,
    language: Language.ENGLISH,
    privacy: PrivacyLevel.PUBLIC,
    notifications: true,
    emailUpdates: true,
  });

  useEffect(() => {
    // Load saved settings on component mount
    const savedSettings = SettingsService.loadSettings();
    setSettings(savedSettings);

    // Sync theme with next-themes
    if (currentTheme) {
      const themeValue = currentTheme.toUpperCase() as Theme;
      setSettings(prev => ({ ...prev, theme: themeValue }));
    }
  }, [currentTheme]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    SettingsService.saveSettings(newSettings);

    // Use next-themes for theme changes
    if (key === 'theme') {
      setTheme(value.toLowerCase());
    }

    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Theme Settings */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Choose your preferred theme for the application
          </p>
          <Select
            value={settings.theme}
            onValueChange={(value) => handleSettingChange('theme', value)}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Theme.SYSTEM} className="text-xs">
                <div className="flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5" />
                  <span>System</span>
                </div>
              </SelectItem>
              <SelectItem value={Theme.LIGHT} className="text-xs">
                <div className="flex items-center gap-2">
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </div>
              </SelectItem>
              <SelectItem value={Theme.DARK} className="text-xs">
                <div className="flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language Settings */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Select your preferred language
          </p>
          <Select
            value={settings.language}
            onValueChange={(value) => handleSettingChange('language', value)}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Language.ENGLISH} className="text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  <span>English</span>
                </div>
              </SelectItem>
              <SelectItem value={Language.SPANISH} className="text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Spanish</span>
                </div>
              </SelectItem>
              <SelectItem value={Language.FRENCH} className="text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  <span>French</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Privacy Settings */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Control who can see your profile and information
          </p>
          <Select
            value={settings.privacy}
            onValueChange={(value) => handleSettingChange('privacy', value)}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Select privacy level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PrivacyLevel.PUBLIC} className="text-xs">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Public</span>
                </div>
              </SelectItem>
              <SelectItem value={PrivacyLevel.FRIENDS} className="text-xs">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Friends Only</span>
                </div>
              </SelectItem>
              <SelectItem value={PrivacyLevel.PRIVATE} className="text-xs">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Private</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notification Settings */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Receive notifications about important updates
          </p>
          <Switch
            checked={settings.notifications}
            onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
          />
        </div>

        {/* Email Updates Settings */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Receive email notifications about your account
          </p>
          <Switch
            checked={settings.emailUpdates}
            onCheckedChange={(checked) => handleSettingChange('emailUpdates', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
