import type { TechStack } from '../projectsApi';

interface StackSelectorProps {
  stacks: TechStack[];
  selected: TechStack | null;
  onSelect: (stack: TechStack) => void;
}

export const StackSelector = ({ stacks, selected, onSelect }: StackSelectorProps) => {
  if (!stacks || stacks.length === 0) {
    return (
      <div className="text-gray-400 text-sm py-4">
        No stack recommendations available for this project.
      </div>
    );
  }

  console.log('StackSelector stacks:', stacks.map(s => s.name)); // Debug duplicates

  return (
    <div className="space-y-3">
      {stacks.map((stack, index) => (
        <div
          key={stack.name || `stack-${index}`}
          onClick={() => onSelect(stack)}
          className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
            selected?.name === stack.name
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/10 bg-slate-800/50 hover:border-purple-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-white">{stack.name}</h4>
            {stack.category && (
              <span className="text-xs px-2 py-1 bg-slate-700 text-gray-300 rounded">
                {stack.category}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {stack.technologies?.slice(0, 4).map((tech, techIndex) => (
              <span 
                key={tech.name || `tech-${techIndex}`} 
                className="text-xs bg-slate-700/50 px-2 py-1 rounded text-gray-300"
              >
                {tech.name}
                {tech.version && <span className="text-gray-500"> ({tech.version})</span>}
              </span>
            ))}
            {stack.technologies && stack.technologies.length > 4 && (
              <span className="text-xs text-gray-500">+{stack.technologies.length - 4}</span>
            )}
          </div>

          {stack.architecture?.pattern && (
            <div className="text-sm text-gray-400 mb-2">
              <span className="font-medium text-gray-300">Architecture:</span> {stack.architecture.pattern}
            </div>
          )}

          {stack.whenToChoose && (
            <p className="text-xs text-gray-500">{stack.whenToChoose}</p>
          )}

          {selected?.name === stack.name && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h5 className="font-semibold text-sm text-white mb-2">Technology Details:</h5>
              <ul className="space-y-2 text-sm">
                {stack.technologies?.map((tech, techIndex) => (
                  <li key={tech.name || `tech-detail-${techIndex}`} className="flex justify-between items-start">
                    <span className="text-gray-300">
                      {tech.name}
                      {tech.version && <span className="text-gray-500 text-xs"> ({tech.version})</span>}
                    </span>
                    {tech.purpose && (
                      <span className="text-gray-500 text-xs text-right max-w-[60%]">
                        {tech.purpose}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              
              {stack.pros && stack.pros.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-green-400 font-semibold">✓ Pros:</span>
                    <ul className="mt-1 space-y-0.5">
                      {stack.pros.slice(0, 3).map((p, prosIndex) => (
                        <li key={`pros-${prosIndex}`} className="text-gray-400">• {p}</li>
                      ))}
                    </ul>
                  </div>
                  {stack.cons && stack.cons.length > 0 && (
                    <div>
                      <span className="text-red-400 font-semibold">✗ Cons:</span>
                      <ul className="mt-1 space-y-0.5">
                        {stack.cons.slice(0, 3).map((c, consIndex) => (
                          <li key={`cons-${consIndex}`} className="text-gray-400">• {c}</li>
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
