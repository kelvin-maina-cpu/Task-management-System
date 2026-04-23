import type { TechStack } from '../projectsApi';

interface StackSelectorProps {
  stacks: TechStack[];
  selected: TechStack | null;
  onSelect: (stack: TechStack) => void;
}

export const StackSelector = ({ stacks, selected, onSelect }: StackSelectorProps) => {
  if (!stacks || stacks.length === 0) {
    return <div className="theme-muted py-4 text-sm">No stack recommendations available for this project.</div>;
  }

  return (
    <div className="space-y-3">
      {stacks.map((stack, index) => (
        <div
          key={stack.name || `stack-${index}`}
          onClick={() => onSelect(stack)}
          className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
            selected?.name === stack.name ? 'border-purple-500 bg-purple-500/10' : 'theme-card theme-card-hover'
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-bold">{stack.name}</h4>
            {stack.category && <span className="theme-subcard rounded border px-2 py-1 text-xs">{stack.category}</span>}
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {stack.technologies?.slice(0, 4).map((tech, techIndex) => (
              <span key={tech.name || `tech-${techIndex}`} className="theme-subcard rounded border px-2 py-1 text-xs">
                {tech.name}
                {tech.version && <span className="theme-soft"> ({tech.version})</span>}
              </span>
            ))}
            {stack.technologies && stack.technologies.length > 4 && <span className="theme-soft text-xs">+{stack.technologies.length - 4}</span>}
          </div>

          {stack.architecture?.pattern && (
            <div className="theme-muted mb-2 text-sm">
              <span className="font-medium">Architecture:</span> {stack.architecture.pattern}
            </div>
          )}

          {stack.whenToChoose && <p className="theme-soft text-xs">{stack.whenToChoose}</p>}

          {selected?.name === stack.name && (
            <div className="theme-divider mt-4 border-t pt-4">
              <h5 className="mb-2 text-sm font-semibold">Technology Details:</h5>
              <ul className="space-y-2 text-sm">
                {stack.technologies?.map((tech, techIndex) => (
                  <li key={tech.name || `tech-detail-${techIndex}`} className="flex items-start justify-between">
                    <span className="theme-muted">
                      {tech.name}
                      {tech.version && <span className="theme-soft text-xs"> ({tech.version})</span>}
                    </span>
                    {tech.purpose && <span className="theme-soft max-w-[60%] text-right text-xs">{tech.purpose}</span>}
                  </li>
                ))}
              </ul>

              {stack.pros && stack.pros.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-green-400">Pros:</span>
                    <ul className="mt-1 space-y-0.5">
                      {stack.pros.slice(0, 3).map((item, prosIndex) => (
                        <li key={`pros-${prosIndex}`} className="theme-muted">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  {stack.cons && stack.cons.length > 0 && (
                    <div>
                      <span className="font-semibold text-red-400">Cons:</span>
                      <ul className="mt-1 space-y-0.5">
                        {stack.cons.slice(0, 3).map((item, consIndex) => (
                          <li key={`cons-${consIndex}`} className="theme-muted">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
