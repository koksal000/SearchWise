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
          <SheetTitle>Ayarlar</SheetTitle>
          <SheetDescription>
            SearchWise deneyiminizi özelleştirin.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-base">
              Karanlık Mod
            </Label>
            <Switch
              id="dark-mode"
              checked={settings.theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="safe-search" className="text-base">
              Güvenli Arama
            </Label>
            <Switch
              id="safe-search"
              checked={settings.safeSearch}
              onCheckedChange={setSafeSearch}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="save-history" className="text-base">
              Arama Geçmişini Kaydet
            </Label>
            <Switch
              id="save-history"
              checked={settings.saveHistory}
              onCheckedChange={setSaveHistory}
            />
          </div>
          <div className="flex flex-col gap-2 rounded-lg border p-4">
             <div className="flex items-center justify-between">
                <Label htmlFor="in-app-view" className="text-base">
                Bağlantıları uygulama içinde aç
                </Label>
                <Switch
                id="in-app-view"
                checked={settings.inAppWebView}
                onCheckedChange={setInAppWebView}
                />
            </div>
            <p className="text-sm text-muted-foreground">
                Etkinleştirildiğinde, bağlantılar uygulama içinde açılır. Bazı siteler düzgün çalışmayabilir.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
