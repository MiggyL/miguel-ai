'use client';

export default function Avatar({ isSpeaking }) {
  const avatarUrl = 'https://models.readyplayer.me/693f7a76fe6f676b663b7cc4.glb';
  
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <img
        src={`https://models.readyplayer.me/693f7a76fe6f676b663b7cc4.png?scene=fullbody-portrait-v1&quality=high`}
        alt="Miguel Avatar"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
            <div class="text-center">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
                M
              </div>
              <p class="text-sm text-gray-500">Miguel's Avatar</p>
            </div>
          `;
        }}
      />
    </div>
  );
}
