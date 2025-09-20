'use client';

import { Button } from "@/components/ui/button";

type PaginationProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
};

export function Pagination({ currentPage, onPageChange, hasNextPage }: PaginationProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="flex items-center font-headline text-3xl font-bold select-none">
        <span style={{ color: '#4681D3' }}>S</span>
        <span style={{ color: '#E67700' }}>e</span>
        <span style={{ color: '#4681D3' }}>a</span>
        <span style={{ color: '#E67700' }}>a</span>
        <span style={{ color: '#4681D3' }}>a</span>
        <span style={{ color: '#E67700' }}>rch</span>
      </div>
      <div className="flex items-center gap-4">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        <span className="font-medium">{currentPage}</span>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
