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
import { Globe } from "lucide-react";

type UrlConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (decision: 'navigate' | 'search') => void;
  url: string;
};

export function UrlConfirmationDialog({ isOpen, onClose, onConfirm, url }: UrlConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <Globe className="h-12 w-12 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">URL Algılandı</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Bir web adresi girdiniz. Ne yapmak istersiniz?
          </AlertDialogDescription>
          <div className="font-mono bg-muted text-foreground p-2 rounded-md mt-2 text-sm break-all">{url}</div>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <AlertDialogAction onClick={() => onConfirm('search')}>
            Bunun Yerine Ara
          </AlertDialogAction>
          <AlertDialogAction onClick={() => onConfirm('navigate')}>
            Adrese Git
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
