import { cn } from '@/libs/auth';

interface NewBadgeProps {
  className?: string;
}

// 미확인 댓글/대댓글/시그널에 공통으로 쓰는 NEW 표시 — 이 플랫폼에서 이미 쓰고 있는 배지 언어를
// 그대로 따른다: 포인트 컬러를 옅게 깐 필(공지 배지와 동일한 bg-primary/10 + text-primary 조합)
// 에 점 인디케이터(new-comments-popover의 미확인 점과 동일한 모양)를 합쳤다. 경고색(빨강)은
// "신고"처럼 모더레이션 경고에만 쓰는 색이라 신규 댓글 표시엔 맞지 않아 포인트 컬러로 바꿨다.
export function NewBadge({ className }: NewBadgeProps) {
  return (
    <span
      className={cn(
        'bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide',
        className,
      )}
    >
      <span className="bg-primary size-1.5 rounded-full" />
      NEW
    </span>
  );
}
