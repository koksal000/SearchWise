'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { useHistory } from '@/hooks/use-history';

type SettingsPanelProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function SettingsPanel({ isOpen, onOpenChange }: SettingsPanelProps) {
  const { settings, toggleTheme, setSafeSearch, setInAppWebView, setSaveHistory } = useSettings();
  const { clearHistory } = useHistory();
  
  const handleClearHistory = () => {
    if(confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
      clearHistory();
    }
  };

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
        <SheetFooter>
           <Button variant="destructive" className="w-full" onClick={handleClearHistory}>
              Clear Search History
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
