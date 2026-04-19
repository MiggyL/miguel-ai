'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function VersionToggle() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentVersion = searchParams.get('v') === '1' ? 1 : 2;

  const switchVersion = (version) => {
    if (version === currentVersion) return;
    const params = new URLSearchParams(searchParams.toString());
    if (version === 1) {
      params.set('v', '1');
    } else {
      params.delete('v');
    }
    const query = params.toString();
    router.push(query ? `?${query}` : '/');
  };

  return (
    <div className="flex items-center gap-1 text-[10px] leading-none tracking-wide select-none">
      <button
        onClick={() => switchVersion(1)}
        className={`cursor-pointer transition-colors ${
          currentVersion === 1
            ? 'text-gray-700 font-medium'
            : 'text-gray-300 hover:text-gray-500'
        }`}
        aria-label="View v1"
      >
        v1
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => switchVersion(2)}
        className={`cursor-pointer transition-colors ${
          currentVersion === 2
            ? 'text-gray-700 font-medium'
            : 'text-gray-300 hover:text-gray-500'
        }`}
        aria-label="View v2"
      >
        v2
      </button>
    </div>
  );
}
