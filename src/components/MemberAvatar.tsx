import { useState } from 'react';
export function MemberAvatar({ url, name, className = '' }: { url?: string; name: string; className?: string }) {
  const [failed, setFailed] = useState('');
  return <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display ${className}`}>
    {url && failed !== url ? <img src={url} alt="" className="h-full w-full object-cover" onError={() => setFailed(url)} /> : name.slice(0, 2).toUpperCase()}
  </div>;
}