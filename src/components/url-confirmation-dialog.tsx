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
          <AlertDialogTitle className="text-center">URL Detected</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You entered a web address. What would you like to do?
            <p className="font-mono bg-muted text-foreground p-2 rounded-md mt-2 text-sm break-all">{url}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <AlertDialogAction onClick={() => onConfirm('search')}>
            Search Instead
          </AlertDialogAction>
          <AlertDialogAction onClick={() => onConfirm('navigate')}>
            Go to Address
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
