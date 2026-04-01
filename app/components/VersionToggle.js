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
    <div className="flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
      <button
        onClick={() => switchVersion(1)}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
          currentVersion === 1
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        v1
      </button>
      <button
        onClick={() => switchVersion(2)}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
          currentVersion === 2
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        v2
      </button>
    </div>
  );
}
