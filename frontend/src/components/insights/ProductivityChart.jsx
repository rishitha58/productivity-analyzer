import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';
import { PASTEL_PALETTE } from '../../utils/colorHelper';

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-lavender-200 shadow-medium">
        <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============ LINE CHART (Weekly Completion Trend) ============
export const ProductivityLineChart = ({ data, title = 'Weekly Productivity' }) => {
  // Default mock data
  const defaultData = data || [
    { day: 'Mon', completed: 5, planned: 8 },
    { day: 'Tue', completed: 7, planned: 9 },
    { day: 'Wed', completed: 6, planned: 7 },
    { day: 'Thu', completed: 8, planned: 10 },
    { day: 'Fri', completed: 9, planned: 11 },
    { day: 'Sat', completed: 4, planned: 6 },
    { day: 'Sun', completed: 6, planned: 8 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-300 to-babyBlue-300 flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500">Tasks completed vs planned</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={defaultData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C3B1E1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#C3B1E1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DCF5" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E8DCF5' }}
          />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E8DCF5' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="planned"
            stroke="#FFD5B8"
            strokeWidth={3}
            dot={{ fill: '#FFD5B8', r: 5 }}
            activeDot={{ r: 7, fill: '#FF9B68' }}
            name="Planned"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#C3B1E1"
            strokeWidth={3}
            dot={{ fill: '#C3B1E1', r: 5 }}
            activeDot={{ r: 7, fill: '#8F6DC1' }}
            name="Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ============ AREA CHART (Focus Time Over Days) ============
export const FocusTimeChart = ({ data, title = 'Focus Time Trend' }) => {
  const defaultData = data || [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.2 },
    { day: 'Wed', hours: 2.8 },
    { day: 'Thu', hours: 4.1 },
    { day: 'Fri', hours: 3.5 },
    { day: 'Sat', hours: 1.5 },
    { day: 'Sun', hours: 2.0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-300 to-babyBlue-300 flex items-center justify-center">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500">Hours spent in focus mode</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={defaultData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B5EAD7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#B5EAD7" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DCF5" />
          <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#69CEA9"
            strokeWidth={3}
            fill="url(#focusGradient)"
            name="Focus Hours"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ============ BAR CHART (Category Distribution) ============
export const CategoryBarChart = ({ data, title = 'Tasks by Category' }) => {
  const defaultData = data || [
    { category: 'Study', count: 25, color: '#C3B1E1' },
    { category: 'Work', count: 18, color: '#B8D8F8' },
    { category: 'Health', count: 12, color: '#B5EAD7' },
    { category: 'Personal', count: 15, color: '#FFD5B8' },
    { category: 'Leisure', count: 8, color: '#FFF3B0' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-peach-300 to-blush-300 flex items-center justify-center">
          <BarChart3 size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500">Task distribution this week</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={defaultData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8DCF5" />
          <XAxis dataKey="category" tick={{ fill: '#6B7280', fontSize: 11 }} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[12, 12, 0, 0]} name="Tasks">
            {defaultData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ============ PIE CHART (Time Distribution) ============
export const CategoryPieChart = ({ data, title = 'Time Distribution' }) => {
  const defaultData = data || [
    { name: 'Study', value: 35 },
    { name: 'Work', value: 25 },
    { name: 'Health', value: 15 },
    { name: 'Personal', value: 15 },
    { name: 'Leisure', value: 10 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 to-peach-300 flex items-center justify-center">
          <PieIcon size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500">How you spend your time</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={defaultData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {defaultData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={PASTEL_PALETTE[idx % PASTEL_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ============ RADIAL CHART (Goal Progress) ============
export const ProductivityScoreChart = ({ score = 75, title = 'Productivity Score' }) => {
  const data = [
    {
      name: 'Score',
      value: score,
      fill: score >= 80 ? '#69CEA9' : score >= 60 ? '#B8D8F8' : score >= 40 ? '#FFF3B0' : '#FFB3B3',
    },
  ];

  const getMessage = () => {
    if (score >= 80) return '🌟 Excellent work!';
    if (score >= 60) return '👍 Good progress!';
    if (score >= 40) return '⚡ Keep going!';
    return '💪 You can do better!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100 text-center"
    >
      <h3 className="font-display font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">Today's performance</p>

      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              minAngle={15}
              clockWise={true}
              dataKey="value"
              cornerRadius={20}
              background={{ fill: '#E8DCF5' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-5xl font-display font-bold text-gradient-primary"
          >
            {score}
          </motion.div>
          <p className="text-xs text-gray-500 font-semibold mt-1">out of 100</p>
        </div>
      </div>

      <p className="text-sm font-medium text-gray-700 mt-3">{getMessage()}</p>
    </motion.div>
  );
};