import React, { useState } from 'react';
import { TenantProfile } from '../types';
import { AVAILABLE_TENANTS } from '../data/initialData';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Lock, 
  Check, 
  UserCheck, 
  Building2, 
  Fingerprint 
} from 'lucide-react';
import { encryptSensitiveDossier, computeSHA256 } from '../services/crypto';

interface AuthTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTenant: TenantProfile;
  onSelectTenant: (tenant: TenantProfile) => void;
}

export const AuthTenantModal: React.FC<AuthTenantModalProps> = ({
  isOpen,
  onClose,
  currentTenant,
  onSelectTenant
}) => {
  const [testString, setTestString] = useState('MARPOL-DETENTION-ORDER-419001420');
  const [encryptedOutput, setEncryptedOutput] = useState<string>('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  if (!isOpen) return null;

  const handleTestEncryption = async () => {
    setIsEncrypting(true);
    try {
      const res = await encryptSensitiveDossier(testString);
      setEncryptedOutput(`${res.cipherTextHex.slice(0, 48)}... (IV: ${res.ivHex})`);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#fff8f5] dark:bg-[#1f1614] border border-[#dbc0c2] dark:border-[#554244] rounded-lg shadow-2xl flex flex-col overflow-hidden text-[#241910] dark:text-[#faede7]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#dbc0c2]/60 dark:border-[#554244]/60 bg-[#ffeada]/40 dark:bg-[#281d1a]/50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#7c2538] dark:text-[#e6758a]" />
              <h3 className="font-serif-display text-2xl font-bold text-[#241910] dark:text-[#faede7]">
                Multi-Tenant Maritime Authority & Role Access
              </h3>
            </div>
            <p className="font-sans text-xs text-[#554244] dark:text-[#d4bec0] mt-1">
              Switch administrative jurisdictions, verify cryptographic public keys, and inspect end-to-end encryption certificates.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#ffeada] dark:hover:bg-[#322521] text-[#887274] hover:text-[#241910] dark:hover:text-[#faede7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant Cards List */}
        <div className="p-6 overflow-y-auto space-y-3 max-h-[55vh]">
          {AVAILABLE_TENANTS.map((tenant) => {
            const isSelected = tenant.id === currentTenant.id;

            return (
              <div
                key={tenant.id}
                onClick={() => onSelectTenant(tenant)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#7c2538] dark:border-[#e6758a] bg-[#ffd9dd]/30 dark:bg-[#7c2538]/20 shadow-xs'
                    : 'border-[#dbc0c2]/60 dark:border-[#554244]/60 bg-[#ffffff] dark:bg-[#251b18] hover:bg-[#ffeada]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif-display text-lg font-bold text-[#241910] dark:text-[#faede7]">
                        {tenant.name}
                      </h4>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#7c2538] text-white font-medium">
                          Active Authority
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#554244] dark:text-[#d4bec0] mt-0.5">
                      Jurisdiction: {tenant.jurisdiction}
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-mono text-xs">
                    <span className="text-[#7c2538] dark:text-[#e6758a] font-semibold">{tenant.role}</span>
                    <div className="text-[10px] text-[#887274] dark:text-[#9c8486]">{tenant.userName}</div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#dbc0c2]/40 dark:border-[#554244]/40 flex items-center justify-between text-[11px] font-mono text-[#887274] dark:text-[#9c8486]">
                  <span className="flex items-center gap-1">
                    <Key className="w-3 h-3 text-[#566153] dark:text-[#9cb099]" />
                    Key: {tenant.encryptionKeyFingerprint}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {tenant.accessTier}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Real Web Crypto E2EE Live Diagnostic Test */}
          <div className="mt-5 p-4 rounded-lg border border-[#dbc0c2]/60 dark:border-[#554244]/60 bg-[#ffeada]/40 dark:bg-[#281d1a]/50 text-xs">
            <div className="flex items-center gap-2 font-mono uppercase font-bold text-[11px] text-[#7c2538] dark:text-[#e6758a] mb-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Real Client-Side AES-GCM 256-Bit E2EE Test</span>
            </div>
            <p className="text-[#554244] dark:text-[#d4bec0]">
              All telemetry transmissions and MARPOL dossiers are encrypted in-memory via the browser SubtleCrypto API prior to transmission over network interfaces.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="text"
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="grow px-3 py-1.5 rounded border border-[#dbc0c2] dark:border-[#554244] bg-[#ffffff] dark:bg-[#16110f] font-mono text-xs text-[#241910] dark:text-[#faede7]"
                placeholder="String to encrypt..."
              />
              <button
                onClick={handleTestEncryption}
                className="py-1.5 px-3 rounded bg-[#7c2538] hover:bg-[#9a3c4e] text-white font-mono text-xs font-medium"
              >
                {isEncrypting ? 'Encrypting...' : 'Test AES-GCM'}
              </button>
            </div>
            {encryptedOutput && (
              <div className="mt-2 p-2 rounded bg-[#16110f] text-emerald-400 font-mono text-[10px] break-all">
                Ciphertext: {encryptedOutput}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dbc0c2]/60 dark:border-[#554244]/60 bg-[#ffeada]/30 dark:bg-[#281d1a]/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#7c2538] hover:bg-[#9a3c4e] text-white text-xs font-medium"
          >
            Confirm & Close
          </button>
        </div>

      </div>
    </div>
  );
};
