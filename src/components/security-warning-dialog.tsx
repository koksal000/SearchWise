'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

type SecurityWarningDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function SecurityWarningDialog({ isOpen, onClose, onConfirm }: SecurityWarningDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">Güvenlik Uyarısı</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Açmaya çalıştığınız bağlantı güvenli olmayan bir bağlantı (HTTP) kullanıyor. Bu siteyle olan bağlantınız özel olmayacak.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel onClick={onClose}>Geri Dön</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Yine de Devam Et
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
