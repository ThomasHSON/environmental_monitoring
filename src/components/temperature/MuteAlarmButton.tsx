import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { alertSoundManager } from '../../utils/alertSound';

const MuteAlarmButton: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);

  // Sync with alert sound manager state
  useEffect(() => {
    const syncMuteState = () => {
      setIsMuted(alertSoundManager.getMuteStatus());
    };

    // Initial sync
    syncMuteState();

    // Set up periodic sync to catch external state changes
    const interval = setInterval(syncMuteState, 100);

    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    if (isMuted) {
      alertSoundManager.unmute();
      setIsMuted(false);
    } else {
      alertSoundManager.mute();
      setIsMuted(true);
    }
  };

  return (
    <button
      onClick={handleToggleMute}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
        isMuted
          ? 'bg-gray-600 text-white hover:bg-gray-700'
          : 'bg-red-600 text-white hover:bg-red-700'
      }`}
      title={isMuted ? '取消靜音警報' : '靜音警報'}
    >
      {isMuted ? (
        <>
          <VolumeX size={16} className="mr-2" />
          警報已靜音
        </>
      ) : (
        <>
          <Volume2 size={16} className="mr-2" />
          靜音警報 (1分鐘後自動停止)
        </>
      )}
    </button>
  );
};

export default MuteAlarmButton;