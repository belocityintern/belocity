"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain } from "lucide-react";

interface ScoreComponent {
  name: string;
  score: number;
  weight: number;
  contribution: number;
}

interface ScoreDisplayProps {
  overallScore: number;
  components: ScoreComponent[];
}

const ProgressBar = ({ score }: { score: number }) => (
  <div className="w-full bg-gray-700 rounded-full h-2.5 my-2">
    <div
      className="bg-primary h-2.5 rounded-full"
      style={{ width: `${score}%` }}
    ></div>
  </div>
);

export function ScoreDisplay({ overallScore, components }: ScoreDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-primary" />
          <CardTitle>Belief Score</CardTitle>
        </div>
        <CardDescription>
          A measure of community belief and momentum.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">Overall Score</p>
          <p className="text-6xl font-bold text-primary">{overallScore.toFixed(2)}</p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Score Components</h4>
          {components.map((component) => (
            <div key={component.name} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{component.name.replace(/_/g, ' ')}</span>
                <span className="text-sm font-bold">{component.score.toFixed(2)} / 100</span>
              </div>
              <ProgressBar score={component.score} />
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Weight: {(component.weight * 100).toFixed(0)}%</span>
                <span>Contribution: {component.contribution.toFixed(2)} pts</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 