import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  onClick?: () => void;
};

export function Logo({ className, onClick }: LogoProps) {
  return (
    <div 
      className={cn("flex items-center font-headline font-bold cursor-pointer select-none", className)}
      onClick={onClick}
    >
      <span style={{ color: '#4681D3' }}>S</span>
      <span style={{ color: '#E67700' }}>e</span>
      <span style={{ color: '#4681D3' }}>a</span>
      <span style={{ color: '#E67700' }}>r</span>
      <span style={{ color: '#4681D3' }}>c</span>
      <span style={{ color: '#E67700' }}>h</span>
      <span className="text-foreground">Wise</span>
    </div>
  );
}
