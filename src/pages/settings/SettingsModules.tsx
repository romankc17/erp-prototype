import { useState } from "react";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { moduleConfigurations } from "../../data";
import type { ModuleConfig } from "../../data";

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          enabled ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ModuleCard({
  module,
  onToggle,
  onToggleSub,
}: {
  module: ModuleConfig;
  onToggle: () => void;
  onToggleSub: (subId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSubModules = module.subModules && module.subModules.length > 0;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
            <Layers className="w-4.5 h-4.5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{module.name}</p>
            {hasSubModules && (
              <p className="text-xs text-slate-500">{module.subModules?.length} sub-modules</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ToggleSwitch enabled={module.enabled} onChange={onToggle} />
          {hasSubModules && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
          )}
        </div>
      </div>
      {expanded && hasSubModules && (
        <div className="px-5 py-3 bg-white border-t border-slate-100 space-y-2">
          {module.subModules?.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-sm text-slate-700">{sub.name}</span>
              </div>
              <ToggleSwitch enabled={sub.enabled} onChange={() => onToggleSub(sub.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsModules() {
  const [modules, setModules] = useState<ModuleConfig[]>(moduleConfigurations);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const toggleSubModule = (moduleId: string, subId: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId || !m.subModules) return m;
        return {
          ...m,
          subModules: m.subModules.map((s) =>
            s.id === subId ? { ...s, enabled: !s.enabled } : s
          ),
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Module Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Enable or disable modules and sub-modules for your business</p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-800">
          Disabling a module will hide it from the sidebar and restrict access for all users except Admin.
        </p>
      </div>

      <div className="space-y-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            onToggle={() => toggleModule(mod.id)}
            onToggleSub={(subId) => toggleSubModule(mod.id, subId)}
          />
        ))}
      </div>
    </div>
  );
}
