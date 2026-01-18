import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { simulationActions } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Simulator = () => {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const currentScore = user?.creditScore || 742;
  const selectedSimulation = simulationActions.find(a => a.id === selectedAction);
  const projectedScore = selectedSimulation 
    ? currentScore + selectedSimulation.impact 
    : currentScore;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Credit Simulator</h1>
            <p className="text-muted-foreground">See how different actions affect your credit score</p>
          </div>
          {selectedAction && (
            <Button
              variant="outline"
              onClick={() => setSelectedAction(null)}
              className="rounded-full px-5 border-border hover:bg-muted"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Score Display */}
        <motion.div layout className="card-stat p-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-center">
              <p className="label-subtle mb-2">Current Score</p>
              <p className="display-number-lg text-foreground">{currentScore}</p>
            </div>
            
            <AnimatePresence mode="wait">
              {selectedAction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-8"
                >
                  <ArrowRight className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="label-subtle mb-2">Projected Score</p>
                    <p 
                      className="display-number-lg"
                      style={{ color: selectedSimulation?.direction === 'up' ? 'hsl(145, 55%, 55%)' : 'hsl(8, 65%, 60%)' }}
                    >
                      {projectedScore}
                    </p>
                  </div>
                  <div 
                    className="px-5 py-3 rounded-full"
                    style={{
                      background: selectedSimulation?.direction === 'up' 
                        ? 'linear-gradient(135deg, hsl(145 55% 42% / 0.2) 0%, hsl(145 55% 42% / 0.1) 100%)'
                        : 'linear-gradient(135deg, hsl(8 65% 50% / 0.2) 0%, hsl(8 65% 50% / 0.1) 100%)',
                      border: `1px solid ${selectedSimulation?.direction === 'up' ? 'hsl(145 55% 42% / 0.3)' : 'hsl(8 65% 50% / 0.3)'}`,
                    }}
                  >
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: selectedSimulation?.direction === 'up' ? 'hsl(145, 55%, 55%)' : 'hsl(8, 65%, 60%)' }}
                    >
                      {selectedSimulation?.impact > 0 ? '+' : ''}{selectedSimulation?.impact}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Action Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground">Select an Action to Simulate</h2>
            
            <div className="space-y-3">
              {simulationActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setSelectedAction(action.id)}
                  className="w-full p-5 rounded-[24px] text-left transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: selectedAction === action.id
                      ? 'linear-gradient(145deg, hsl(28 40% 15%) 0%, hsl(28 35% 11%) 100%)'
                      : 'linear-gradient(145deg, hsl(25 10% 14%) 0%, hsl(25 10% 11%) 100%)',
                    border: selectedAction === action.id
                      ? '1px solid hsl(28 85% 52% / 0.4)'
                      : '1px solid hsl(25 10% 18%)',
                    boxShadow: selectedAction === action.id
                      ? '0 4px 24px -4px hsl(28 85% 52% / 0.2)'
                      : '0 4px 24px -4px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{action.title}</h3>
                        {selectedAction === action.id && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: 'linear-gradient(135deg, hsl(28 85% 52%) 0%, hsl(25 80% 45%) 100%)',
                              color: 'hsl(20 8% 6%)',
                            }}
                          >
                            Selected
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <div 
                      className="ml-4 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: action.direction === 'up'
                          ? 'linear-gradient(135deg, hsl(145 55% 42% / 0.2) 0%, hsl(145 55% 42% / 0.1) 100%)'
                          : 'linear-gradient(135deg, hsl(8 65% 50% / 0.2) 0%, hsl(8 65% 50% / 0.1) 100%)',
                      }}
                    >
                      {action.direction === 'up' 
                        ? <TrendingUp className="w-5 h-5" style={{ color: 'hsl(145, 55%, 55%)' }} />
                        : <TrendingDown className="w-5 h-5" style={{ color: 'hsl(8, 65%, 60%)' }} />
                      }
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Result Panel */}
          <AnimatePresence mode="wait">
            {selectedSimulation ? (
              <motion.div
                key={selectedAction}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Impact Summary */}
                <div className={selectedSimulation.direction === 'up' ? 'card-green' : 'card-coral'}>
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: selectedSimulation.direction === 'up'
                          ? 'linear-gradient(135deg, hsl(145 55% 42% / 0.3) 0%, hsl(145 55% 42% / 0.15) 100%)'
                          : 'linear-gradient(135deg, hsl(8 65% 50% / 0.3) 0%, hsl(8 65% 50% / 0.15) 100%)',
                      }}
                    >
                      {selectedSimulation.direction === 'up' 
                        ? <TrendingUp className="w-7 h-7" style={{ color: 'hsl(145, 55%, 55%)' }} />
                        : <TrendingDown className="w-7 h-7" style={{ color: 'hsl(8, 65%, 60%)' }} />
                      }
                    </div>
                    <div>
                      <p className="label-subtle">Expected Impact</p>
                      <p 
                        className="text-3xl font-bold"
                        style={{ color: selectedSimulation.direction === 'up' ? 'hsl(145, 55%, 55%)' : 'hsl(8, 65%, 60%)' }}
                      >
                        {selectedSimulation.impact > 0 ? '+' : ''}{selectedSimulation.impact} points
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Approximate change to your credit score if you {selectedSimulation.title.toLowerCase()}
                  </p>
                </div>

                {/* Explanation */}
                <div className="card-stat">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, hsl(38 85% 52% / 0.2) 0%, hsl(38 85% 52% / 0.1) 100%)',
                      }}
                    >
                      <AlertTriangle className="w-5 h-5" style={{ color: 'hsl(38, 85%, 60%)' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Why This Happens</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedSimulation.explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alternative Suggestion */}
                <div 
                  className="rounded-[24px] p-6"
                  style={{
                    background: 'linear-gradient(145deg, hsl(28 40% 14%) 0%, hsl(28 35% 10%) 100%)',
                    border: '1px solid hsl(28 85% 52% / 0.2)',
                    boxShadow: '0 4px 24px -4px hsl(28 85% 52% / 0.1)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, hsl(28 85% 52% / 0.2) 0%, hsl(28 85% 52% / 0.1) 100%)',
                      }}
                    >
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Safer Alternative</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedSimulation.alternative}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score Visualization */}
                <div className="card-stat">
                  <p className="label-subtle mb-4">Score Range Impact</p>
                  <div 
                    className="relative h-8 rounded-full overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, hsl(25 10% 10%) 0%, hsl(25 10% 8%) 100%)',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-foreground z-10 rounded-full"
                      style={{ left: `${((currentScore - 300) / 600) * 100}%` }}
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.abs(selectedSimulation.impact / 600) * 100}%`,
                        left: selectedSimulation.direction === 'up' 
                          ? `${((currentScore - 300) / 600) * 100}%`
                          : `${((projectedScore - 300) / 600) * 100}%`
                      }}
                      className="absolute top-0 bottom-0 rounded-full"
                      style={{
                        background: selectedSimulation.direction === 'up' 
                          ? 'hsl(145, 55%, 42%, 0.5)' 
                          : 'hsl(8, 65%, 50%, 0.5)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                    <span>300 (Poor)</span>
                    <span>600</span>
                    <span>900 (Excellent)</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full min-h-[400px]"
              >
                <div className="text-center">
                  <div 
                    className="w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: 'linear-gradient(145deg, hsl(25 10% 14%) 0%, hsl(25 10% 11%) 100%)',
                      boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <Sparkles className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Select an action</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Choose an action from the left to see how it would affect your credit score
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Simulator;
