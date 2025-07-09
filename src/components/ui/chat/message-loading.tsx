// @hidden
export default function MessageLoading() {
  return (
    <div className="flex items-center space-x-1 py-1">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
      </div>
      <span className="text-xs text-muted-foreground ml-2">AI가 답변을 작성 중입니다</span>
    </div>
  );
}
