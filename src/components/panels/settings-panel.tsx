'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/use-settings';

type SettingsPanelProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function SettingsPanel({ isOpen, onOpenChange }: SettingsPanelProps) {
  const { settings, toggleTheme, setSafeSearch, setInAppWebView, setSaveHistory } = useSettings();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your SearchWise experience.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-base">
              Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={settings.theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="safe-search" className="text-base">
              Safe Search
            </Label>
            <Switch
              id="safe-search"
              checked={settings.safeSearch}
              onCheckedChange={setSafeSearch}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="in-app-view" className="text-base">
              Open links in-app
            </Label>
            <Switch
              id="in-app-view"
              checked={settings.inAppWebView}
              onCheckedChange={setInAppWebView}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="save-history" className="text-base">
              Save Search History
            </Label>
            <Switch
              id="save-history"
              checked={settings.saveHistory}
              onCheckedChange={setSaveHistory}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
