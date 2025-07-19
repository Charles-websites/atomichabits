/**
 * 《原子習慣》核心概念展示頁面
 * 展示James Clear著作的關鍵理念和實用技巧
 */

import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, TrendingUp, Target, Zap, Users, Clock, Star, Plus, Check, X, Calendar, BarChart3, Lightbulb, Play, Pause, RotateCcw, Edit3, Trash2, Award, CheckCircle2, Circle, Filter, PieChart, Move, Grip, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  streak: number;
  completedDates: string[];
  isActive: boolean;
  target: number;
  unit: string;
}

interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  difficulty: '簡單' | '中等' | '困難';
  timeRequired: string;
  duration: number; // 持續時間（分鐘）
  tips: string[];
}

interface TimeBlock {
  id: string;
  activity: string;
  startHour: number; // 支援小數，如 8.5 表示 8:30
  endHour: number;   // 支援小數，如 9.25 表示 9:15
  category: string;
  color: string;
  day?: number; // 0-6 代表週日到週六
}

interface TimeCategory {
  name: string;
  color: string;
  weekdayMinutes: number;
  weekendMinutes: number;
}

interface WeeklySchedule {
  [key: number]: TimeBlock[]; // key是天數(0-6)，value是該天的時間塊陣列
}

export default function Home() {
  const [selectedSection, setSelectedSection] = useState('overview');
  const [activeHabitStep, setActiveHabitStep] = useState(0);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [draggedHabit, setDraggedHabit] = useState<HabitTemplate | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1); // 週一為預設
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({});
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 一週天數
  const weekDays = [
    { id: 0, name: '週日', short: '日' },
    { id: 1, name: '週一', short: '一' },
    { id: 2, name: '週二', short: '二' },
    { id: 3, name: '週三', short: '三' },
    { id: 4, name: '週四', short: '四' },
    { id: 5, name: '週五', short: '五' },
    { id: 6, name: '週六', short: '六' }
  ];

  // 習慣模板狀態 - 讓模板可以被編輯
  const [habitTemplates, setHabitTemplates] = useState<HabitTemplate[]>([
    // 學習成長
    {
      id: '1',
      name: '每日閱讀',
      description: '每天閱讀15分鐘，培養學習習慣',
      category: '學習成長',
      icon: '📚',
      difficulty: '簡單',
      timeRequired: '15分鐘',
      duration: 15,
      tips: ['選擇感興趣的書籍', '固定時間閱讀', '記錄讀書心得']
    },
    {
      id: '2',
      name: '線上課程學習',
      description: '每天觀看30分鐘線上課程',
      category: '學習成長',
      icon: '🎓',
      difficulty: '中等',
      timeRequired: '30分鐘',
      duration: 30,
      tips: ['選擇符合目標的課程', '做筆記整理重點', '實際練習課程內容']
    },
    {
      id: '3',
      name: '寫作練習',
      description: '每天寫作20分鐘，提升表達能力',
      category: '學習成長',
      icon: '✍️',
      difficulty: '中等',
      timeRequired: '20分鐘',
      duration: 20,
      tips: ['設定寫作主題', '不追求完美，重點是持續', '定期回顧改進']
    },
    {
      id: '4',
      name: '語言學習',
      description: '每天學習外語25分鐘',
      category: '學習成長',
      icon: '🌍',
      difficulty: '中等',
      timeRequired: '25分鐘',
      duration: 25,
      tips: ['使用多媒體資源', '練習聽說讀寫', '與母語者交流']
    },
    // 健康生活
    {
      id: '5',
      name: '晨間運動',
      description: '每天早晨運動30分鐘，保持身體健康',
      category: '健康生活',
      icon: '💪',
      difficulty: '中等',
      timeRequired: '30分鐘',
      duration: 30,
      tips: ['前一晚準備運動服裝', '選擇喜歡的運動形式', '記錄運動成果']
    },
    {
      id: '6',
      name: '瑜伽伸展',
      description: '每天練習15分鐘瑜伽或伸展',
      category: '健康生活',
      icon: '🧘',
      difficulty: '簡單',
      timeRequired: '15分鐘',
      duration: 15,
      tips: ['選擇安靜的空間', '專注呼吸和動作', '循序漸進增加難度']
    },
    {
      id: '7',
      name: '步行散步',
      description: '每天散步20分鐘，享受戶外時光',
      category: '健康生活',
      icon: '🚶',
      difficulty: '簡單',
      timeRequired: '20分鐘',
      duration: 20,
      tips: ['選擇安全的路線', '聆聽音樂或播客', '邀請朋友一起']
    },
    {
      id: '8',
      name: '健康飲食',
      description: '每餐攝取均衡營養',
      category: '健康生活',
      icon: '🥗',
      difficulty: '中等',
      timeRequired: '每餐',
      duration: 60,
      tips: ['準備健康食材', '控制份量', '減少加工食品']
    },
    // 心靈成長
    {
      id: '9',
      name: '感恩日記',
      description: '每天記錄三件感恩的事情',
      category: '心靈成長',
      icon: '🙏',
      difficulty: '簡單',
      timeRequired: '5分鐘',
      duration: 5,
      tips: ['準備專用筆記本', '睡前回顧一天', '寫下具體細節']
    },
    {
      id: '10',
      name: '深呼吸冥想',
      description: '每天練習10分鐘深呼吸冥想',
      category: '心靈成長',
      icon: '🧘',
      difficulty: '中等',
      timeRequired: '10分鐘',
      duration: 10,
      tips: ['找安靜的環境', '專注於呼吸節奏', '逐步延長時間']
    },
    {
      id: '11',
      name: '正念練習',
      description: '每天進行5分鐘正念觀察',
      category: '心靈成長',
      icon: '🌸',
      difficulty: '簡單',
      timeRequired: '5分鐘',
      duration: 5,
      tips: ['觀察當下感受', '不批判任何想法', '保持開放心態']
    },
    // 生活習慣
    {
      id: '12',
      name: '整理桌面',
      description: '每天工作結束後整理桌面',
      category: '生活習慣',
      icon: '🗂️',
      difficulty: '簡單',
      timeRequired: '5分鐘',
      duration: 5,
      tips: ['歸類文件', '清潔桌面', '準備明天用品']
    },
    {
      id: '13',
      name: '規律就寢',
      description: '每天固定時間上床睡覺',
      category: '生活習慣',
      icon: '🛏️',
      difficulty: '中等',
      timeRequired: '8小時',
      duration: 480,
      tips: ['設定就寢鬧鐘', '睡前避免藍光', '保持臥室涼爽']
    },
    {
      id: '14',
      name: '晨間例行公事',
      description: '建立固定的晨間儀式',
      category: '生活習慣',
      icon: '🌅',
      difficulty: '中等',
      timeRequired: '30分鐘',
      duration: 30,
      tips: ['前一晚準備', '包含運動或冥想', '保持一致性']
    },
    // 日常活動
    {
      id: '15',
      name: '用餐時間',
      description: '規律的三餐時間安排',
      category: '日常活動',
      icon: '🍽️',
      difficulty: '簡單',
      timeRequired: '1.5小時/天',
      duration: 90,
      tips: ['固定用餐時間', '專心用餐', '控制份量']
    },
    {
      id: '16',
      name: '通勤時間',
      description: '有效利用通勤時間學習',
      category: '日常活動',
      icon: '🚗',
      difficulty: '簡單',
      timeRequired: '依路程而定',
      duration: 60,
      tips: ['聽播客或有聲書', '複習當天計劃', '練習語言']
    },
    {
      id: '17',
      name: '家務清潔',
      description: '每天花15分鐘整理家務',
      category: '日常活動',
      icon: '🧹',
      difficulty: '簡單',
      timeRequired: '15分鐘',
      duration: 15,
      tips: ['分工處理', '邊聽音樂邊做', '養成隨手收拾習慣']
    },
    {
      id: '18',
      name: '個人護理',
      description: '晨間和晚間的個人清潔時間',
      category: '日常活動',
      icon: '🚿',
      difficulty: '簡單',
      timeRequired: '30分鐘/天',
      duration: 30,
      tips: ['建立固定流程', '選用好的護理產品', '享受放鬆時光']
    },
    // 工作效率
    {
      id: '19',
      name: '番茄工作法',
      description: '專注工作25分鐘後休息5分鐘',
      category: '工作效率',
      icon: '🍅',
      difficulty: '中等',
      timeRequired: '25分鐘',
      duration: 25,
      tips: ['關閉所有干擾', '專注單一任務', '記錄完成的番茄數']
    },
    {
      id: '20',
      name: '每日計劃',
      description: '每天早上規劃當日任務',
      category: '工作效率',
      icon: '📋',
      difficulty: '簡單',
      timeRequired: '10分鐘',
      duration: 10,
      tips: ['列出3個重要任務', '預估所需時間', '晚上檢討執行情況']
    },
    // 社交關係
    {
      id: '21',
      name: '聯絡親友',
      description: '每週主動聯絡一位親友',
      category: '社交關係',
      icon: '📞',
      difficulty: '簡單',
      timeRequired: '15分鐘',
      duration: 15,
      tips: ['輪流聯絡不同朋友', '真誠關心對方', '安排面對面聚會']
    },
    {
      id: '22',
      name: '家庭時間',
      description: '每天與家人共度優質時光',
      category: '社交關係',
      icon: '👨‍👩‍👧‍👦',
      difficulty: '中等',
      timeRequired: '1小時',
      duration: 60,
      tips: ['收起電子設備', '一起進行活動', '專心聆聽交談']
    }
  ]);

  // 時間類別設定
  const timeCategories: TimeCategory[] = [
    { name: '工作', color: '#3B82F6', weekdayMinutes: 480, weekendMinutes: 0 },
    { name: '學習', color: '#10B981', weekdayMinutes: 60, weekendMinutes: 120 },
    { name: '運動', color: '#F59E0B', weekdayMinutes: 30, weekendMinutes: 60 },
    { name: '休息', color: '#EF4444', weekdayMinutes: 480, weekendMinutes: 540 },
    { name: '用餐', color: '#8B5CF6', weekdayMinutes: 90, weekendMinutes: 120 },
    { name: '通勤', color: '#6B7280', weekdayMinutes: 60, weekendMinutes: 0 },
    { name: '娛樂', color: '#EC4899', weekdayMinutes: 120, weekendMinutes: 240 },
    { name: '家務', color: '#14B8A6', weekdayMinutes: 30, weekendMinutes: 60 },
    { name: '其他', color: '#9CA3AF', weekdayMinutes: 180, weekendMinutes: 300 }
  ];

  // 預設時間安排
  const defaultTimeBlocks: TimeBlock[] = [
    { id: '1', activity: '睡覺', startHour: 0, endHour: 7, category: '休息', color: '#EF4444' },
    { id: '2', activity: '晨間例行公事', startHour: 7, endHour: 8, category: '日常活動', color: '#9CA3AF' },
    { id: '3', activity: '通勤', startHour: 8, endHour: 9, category: '通勤', color: '#6B7280' },
    { id: '4', activity: '工作', startHour: 9, endHour: 12, category: '工作', color: '#3B82F6' },
    { id: '5', activity: '午餐', startHour: 12, endHour: 13, category: '用餐', color: '#8B5CF6' },
    { id: '6', activity: '工作', startHour: 13, endHour: 18, category: '工作', color: '#3B82F6' },
    { id: '7', activity: '通勤', startHour: 18, endHour: 19, category: '通勤', color: '#6B7280' },
    { id: '8', activity: '運動', startHour: 19, endHour: 20, category: '運動', color: '#F59E0B' },
    { id: '9', activity: '晚餐', startHour: 20, endHour: 21, category: '用餐', color: '#8B5CF6' },
    { id: '10', activity: '學習/閱讀', startHour: 21, endHour: 22, category: '學習', color: '#10B981' },
    { id: '11', activity: '休閒娛樂', startHour: 22, endHour: 24, category: '娛樂', color: '#EC4899' }
  ];

  // 初始化週間計劃
  useEffect(() => {
    if (Object.keys(weeklySchedule).length === 0) {
      const initialSchedule: WeeklySchedule = {};
      weekDays.forEach(day => {
        initialSchedule[day.id] = defaultTimeBlocks.map(block => ({
          ...block,
          id: `${day.id}-${block.id}`,
          day: day.id
        }));
      });
      setWeeklySchedule(initialSchedule);
    }
  }, []);

  const habitLoop = [
    { step: 'CUE', title: '線索', description: '觸發大腦啟動行為', color: 'bg-blue-500', law: '讓它顯而易見' },
    { step: 'CRAVING', title: '渴求', description: '行為背後的動機力量', color: 'bg-green-500', law: '讓它有吸引力' },
    { step: 'RESPONSE', title: '反應', description: '你實際執行的習慣', color: 'bg-yellow-500', law: '讓它簡單易行' },
    { step: 'REWARD', title: '獎勵', description: '滿足渴求並強化行為', color: 'bg-red-500', law: '讓它令人滿意' }
  ];

  const identityLayers = [
    { layer: 'OUTCOMES', title: '結果', description: '你獲得什麼（例如：減重）', color: 'bg-gray-100 text-gray-800' },
    { layer: 'PROCESSES', title: '過程', description: '你做什麼（例如：去健身房）', color: 'bg-blue-100 text-blue-800' },
    { layer: 'IDENTITY', title: '身份', description: '你相信什麼（例如：我是健康的人）', color: 'bg-purple-100 text-purple-800' }
  ];

  const techniques = [
    { title: '習慣疊加', desc: '在現有習慣後添加新習慣', icon: '🔗' },
    { title: '環境設計', desc: '改變環境讓好習慣更明顯', icon: '🏠' },
    { title: '兩分鐘法則', desc: '新習慣應在兩分鐘內完成', icon: '⏰' },
    { title: '習慣追蹤', desc: '可視化追蹤進度', icon: '📊' },
    { title: '誘惑捆綁', desc: '將需要做的和想做的結合', icon: '🎁' },
    { title: '實施意圖', desc: '我將在[時間]在[地點]做[行為]', icon: '📝' }
  ];

  // 獲取所有類別
  const allCategories = ['全部', ...Array.from(new Set(habitTemplates.map(t => t.category)))];

  // 過濾習慣模板
  const filteredTemplates = selectedCategory === '全部' 
    ? habitTemplates 
    : habitTemplates.filter(t => t.category === selectedCategory);

  // 習慣循環動畫效果
  useEffect(() => {
    if (selectedSection === 'habit-loop') {
      const interval = setInterval(() => {
        setActiveHabitStep((prev) => (prev + 1) % habitLoop.length);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedSection]);

  // 添加習慣
  const addHabit = (template?: HabitTemplate) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: template ? template.name : newHabitName,
      description: template ? template.description : newHabitDesc,
      category: template ? template.category : '自定義',
      streak: 0,
      completedDates: [],
      isActive: true,
      target: 1,
      unit: '次'
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setNewHabitDesc('');
    setSelectedTemplate(null);
  };

  // 完成習慣
  const completeHabit = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        if (!habit.completedDates.includes(today)) {
          return {
            ...habit,
            completedDates: [...habit.completedDates, today],
            streak: habit.streak + 1
          };
        }
      }
      return habit;
    }));
  };

  // 刪除習慣
  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };

  // 獲取今日完成狀態
  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
  };

  // 計算完成率
  const getCompletionRate = (habit: Habit) => {
    if (habit.completedDates.length === 0) return 0;
    const daysSinceStart = Math.max(1, Math.ceil((Date.now() - new Date(habit.completedDates[0]).getTime()) / (1000 * 60 * 60 * 24)));
    return Math.round((habit.completedDates.length / daysSinceStart) * 100);
  };

  // 處理拖拽開始
  const handleDragStart = (e: React.DragEvent, template: HabitTemplate) => {
    setDraggedHabit(template);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 處理拖拽結束
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 處理拖拽結束
  const handleDragEnd = () => {
    setDraggedHabit(null);
  };

  // 找到可放置的最近位置
  const findAvailableSlot = (targetHour: number, duration: number) => {
    const currentBlocks = weeklySchedule[selectedDay] || [];
    const durationHours = duration / 60;
    
    // 從目標小時開始，尋找可用的時間段
    for (let startTime = targetHour; startTime + durationHours <= 24; startTime += 0.25) {
      const endTime = startTime + durationHours;
      
      // 檢查是否與現有時間塊衝突
      const hasConflict = currentBlocks.some(block => 
        (startTime < block.endHour && endTime > block.startHour)
      );
      
      if (!hasConflict) {
        return { startHour: startTime, endHour: endTime };
      }
    }
    
    // 如果找不到位置，返回原始位置
    return { startHour: targetHour, endHour: Math.min(targetHour + durationHours, 24) };
  };

  // 處理放置
  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    if (draggedHabit) {
      const availableSlot = findAvailableSlot(hour, draggedHabit.duration);
      
      const newTimeBlock: TimeBlock = {
        id: `${selectedDay}-${Date.now()}`,
        activity: draggedHabit.name,
        startHour: availableSlot.startHour,
        endHour: availableSlot.endHour,
        category: draggedHabit.category,
        color: getColorForCategory(draggedHabit.category),
        day: selectedDay
      };
      
      setWeeklySchedule(prev => ({
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), newTimeBlock]
      }));
      setDraggedHabit(null);
    }
  };

  // 編輯時間塊
  const editTimeBlock = (blockId: string, newStartHour: number, newEndHour: number, newActivity?: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay]?.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              startHour: newStartHour, 
              endHour: newEndHour,
              activity: newActivity || block.activity
            }
          : block
      ) || []
    }));
    setEditingBlock(null);
  };

  // 刪除時間塊
  const deleteTimeBlock = (blockId: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay]?.filter(block => block.id !== blockId) || []
    }));
  };

  // 根據類別獲取顏色
  const getColorForCategory = (category: string) => {
    const colorMap: { [key: string]: string } = {
      '學習成長': '#10B981',
      '健康生活': '#F59E0B',
      '心靈成長': '#8B5CF6',
      '生活習慣': '#14B8A6',
      '日常活動': '#9CA3AF',
      '工作效率': '#3B82F6',
      '社交關係': '#EC4899'
    };
    return colorMap[category] || '#6B7280';
  };

  // 獲取當前選中天的時間塊
  const getCurrentDayBlocks = () => {
    return weeklySchedule[selectedDay] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">原子習慣</span>
            </div>
            
            {/* 桌面端導航 */}
            <div className="hidden lg:flex space-x-6 items-center">
              {[
                { id: 'overview', name: '概覽', icon: BookOpen },
                { id: 'identity', name: '身份模型', icon: Target },
                { id: 'habit-loop', name: '習慣循環', icon: Zap },
                { id: 'plateau', name: '潛在潛能', icon: TrendingUp },
                { id: 'time-planner', name: '時間規劃', icon: Calendar },
                { id: 'tracker', name: '習慣追蹤', icon: BarChart3 },
                { id: 'planner', name: '習慣計劃', icon: Lightbulb }
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedSection(id)}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    selectedSection === id 
                      ? 'bg-indigo-100 text-indigo-700 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {name}
                </button>
              ))}
            </div>

            {/* 手機端漢堡菜單按鈕 */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 手機端下拉菜單 */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {[
                { id: 'overview', name: '概覽', icon: BookOpen },
                { id: 'identity', name: '身份模型', icon: Target },
                { id: 'habit-loop', name: '習慣循環', icon: Zap },
                { id: 'plateau', name: '潛在潛能', icon: TrendingUp },
                { id: 'time-planner', name: '時間規劃', icon: Calendar },
                { id: 'tracker', name: '習慣追蹤', icon: BarChart3 },
                { id: 'planner', name: '習慣計劃', icon: Lightbulb }
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedSection(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                    selectedSection === id 
                      ? 'bg-indigo-100 text-indigo-700 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* 概覽部分 */}
        {selectedSection === 'overview' && (
          <div className="space-y-12">
            {/* 主標題區域 */}
            <div className="text-center animate-fade-in">
              <h1 className="text-5xl font-bold text-gray-900 mb-4 animate-bounce-in">
                原子習慣
              </h1>
              <p className="text-xl text-gray-600 mb-2">微小改變，顯著效果</p>
              <p className="text-lg text-gray-500">James Clear 著</p>
              <div className="mt-8">
                <Badge variant="secondary" className="text-lg px-4 py-2 animate-pulse">
                  紐約時報暢銷書 #1
                </Badge>
              </div>
            </div>

            {/* 核心概念卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: TrendingUp,
                  title: '1% 法則',
                  number: '37.78倍',
                  desc: '每天進步1%，一年後你將進步37.78倍',
                  color: 'text-green-500',
                  bgColor: 'bg-green-50'
                },
                {
                  icon: Target,
                  title: '專注系統',
                  number: '忘記目標',
                  desc: '好習慣重複出現不是因為你想改變，而是因為你有了正確的系統',
                  color: 'text-blue-500',
                  bgColor: 'bg-blue-50'
                },
                {
                  icon: Users,
                  title: '身份改變',
                  number: '成為那種人',
                  desc: '最有效的改變習慣方法是改變身份認同',
                  color: 'text-purple-500',
                  bgColor: 'bg-purple-50'
                }
              ].map((concept, index) => (
                <Card key={index} className={`text-center hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${concept.bgColor} border-none`}>
                  <CardHeader>
                    <concept.icon className={`h-12 w-12 ${concept.color} mx-auto mb-4 animate-bounce`} />
                    <CardTitle className="text-2xl">{concept.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${concept.color} mb-2`}>{concept.number}</p>
                    <p className="text-gray-600">{concept.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 實用技巧網格 */}
            <div>
              <h2 className="text-3xl font-bold text-center mb-8 animate-slide-up">核心技巧</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {techniques.map((technique, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105">
                    <CardContent className="p-6">
                      <div className="text-4xl mb-4 group-hover:animate-bounce">{technique.icon}</div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">
                        {technique.title}
                      </h3>
                      <p className="text-gray-600">{technique.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 身份模型部分 */}
        {selectedSection === 'identity' && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">三層行為改變模型</h2>
              <p className="text-xl text-gray-600">真正的行為改變是身份改變</p>
            </div>

            <div className="flex justify-center">
              <div className="relative w-96 h-96">
                {/* 同心圓 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 rounded-full border-4 border-gray-300 bg-gray-50 flex items-center justify-center relative animate-pulse">
                    <div className="w-56 h-56 rounded-full border-4 border-blue-300 bg-blue-50 flex items-center justify-center relative animate-pulse" style={{animationDelay: '0.5s'}}>
                      <div className="w-32 h-32 rounded-full border-4 border-purple-300 bg-purple-100 flex items-center justify-center animate-pulse" style={{animationDelay: '1s'}}>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-purple-800">IDENTITY</div>
                          <div className="text-xs text-purple-600">身份認同</div>
                        </div>
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-blue-800">PROCESSES</div>
                          <div className="text-xs text-blue-600">過程系統</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-800">OUTCOMES</div>
                        <div className="text-xs text-gray-600">結果目標</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {identityLayers.map((layer, index) => (
                <Card key={index} className={`${layer.color} border-none hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2">{layer.title}</h3>
                    <p className="text-sm">{layer.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <blockquote className="text-2xl italic text-gray-700 animate-fade-in">
                「與自我不一致的行為不會持久」
              </blockquote>
              <cite className="text-gray-500 mt-2 block">— James Clear</cite>
            </div>
          </div>
        )}

        {/* 習慣循環部分 */}
        {selectedSection === 'habit-loop' && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">習慣循環 & 行為改變四法則</h2>
              <p className="text-xl text-gray-600">每個習慣都遵循相同的四步循環</p>
            </div>

            {/* 習慣循環可視化 */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex items-center space-x-8">
                  {habitLoop.map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <button
                        onClick={() => setActiveHabitStep(index)}
                        className={`w-24 h-24 rounded-full ${step.color} text-white font-bold text-sm transition-all duration-500 ${
                          activeHabitStep === index 
                            ? 'scale-125 shadow-2xl animate-bounce' 
                            : isAnimating && activeHabitStep === index 
                            ? 'scale-110 animate-pulse' 
                            : 'scale-100 hover:scale-110'
                        }`}
                      >
                        {step.step}
                      </button>
                      {index < habitLoop.length - 1 && (
                        <ChevronRight className="absolute h-6 w-6 text-gray-400 animate-pulse" style={{left: `${(index + 1) * 128 - 12}px`, top: '36px'}} />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* 循環箭頭 */}
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center text-gray-400">
                    <div className="w-32 h-0.5 bg-gray-300"></div>
                    <ChevronRight className="h-4 w-4 ml-2 animate-pulse" />
                    <span className="ml-2 text-sm">循環強化</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 選中步驟的詳細信息 */}
            <Card className="max-w-2xl mx-auto transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-8">
                <div className={`inline-block px-4 py-2 rounded-full ${habitLoop[activeHabitStep].color} text-white text-sm font-semibold mb-4 animate-bounce`}>
                  {habitLoop[activeHabitStep].step}
                </div>
                <h3 className="text-2xl font-bold mb-2">{habitLoop[activeHabitStep].title}</h3>
                <p className="text-gray-600 mb-4">{habitLoop[activeHabitStep].description}</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-indigo-600">對應法則: {habitLoop[activeHabitStep].law}</p>
                </div>
              </CardContent>
            </Card>

            {/* 四法則總結 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-green-600">建立好習慣</h3>
                <div className="space-y-4">
                  {habitLoop.map((step, index) => (
                    <div key={index} className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-300 transform hover:scale-105">
                      <div className={`w-8 h-8 rounded-full ${step.color} text-white flex items-center justify-center text-xs font-bold mr-4`}>
                        {index + 1}
                      </div>
                      <span className="font-semibold">{step.law}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4 text-red-600">打破壞習慣</h3>
                <div className="space-y-4">
                  {['讓它隱而不見', '讓它缺乏吸引力', '讓它困難重重', '讓它令人不滿'].map((law, index) => (
                    <div key={index} className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-300 transform hover:scale-105">
                      <div className={`w-8 h-8 rounded-full ${habitLoop[index].color} opacity-60 text-white flex items-center justify-center text-xs font-bold mr-4`}>
                        {index + 1}
                      </div>
                      <span className="font-semibold">{law}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 潛在潛能平台部分 */}
        {selectedSection === 'plateau' && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">潛在潛能平台</h2>
              <p className="text-xl text-gray-600">突破往往發生在失望之谷之後</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative h-64">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  {/* 期望線 - 直線上升 */}
                  <line 
                    x1="50" y1="150" 
                    x2="350" y2="50" 
                    stroke="#3B82F6" 
                    strokeWidth="3" 
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                  <text x="360" y="45" className="text-xs fill-blue-600">你以為會發生的</text>
                  
                  {/* 實際線 - S曲線 */}
                  <path 
                    d="M 50 150 Q 150 140 200 130 Q 250 110 350 60" 
                    stroke="#10B981" 
                    strokeWidth="3" 
                    fill="none"
                    className="animate-pulse"
                    style={{animationDelay: '0.5s'}}
                  />
                  <text x="360" y="65" className="text-xs fill-green-600">實際發生的</text>
                  
                  {/* 失望之谷標註 */}
                  <ellipse 
                    cx="150" cy="135" rx="40" ry="15" 
                    fill="none" stroke="#EF4444" strokeWidth="2" 
                    strokeDasharray="3,3" 
                    className="animate-pulse"
                    style={{animationDelay: '1s'}}
                  />
                  <text x="110" y="165" className="text-xs fill-red-600">失望之谷</text>
                  
                  {/* 坐標軸 */}
                  <line x1="50" y1="150" x2="350" y2="150" stroke="#374151" strokeWidth="1" />
                  <line x1="50" y1="150" x2="50" y2="50" stroke="#374151" strokeWidth="1" />
                  
                  <text x="200" y="170" className="text-sm fill-gray-600">時間</text>
                  <text x="20" y="100" className="text-sm fill-gray-600" transform="rotate(-90 20 100)">結果</text>
                </svg>
              </div>
              
              <div className="text-center mt-8">
                <blockquote className="text-lg italic text-gray-700 animate-fade-in">
                  「抱怨努力工作卻沒有成功，就像抱怨冰塊在25-31度時沒有融化一樣。你的工作沒有白費，只是被儲存了起來。所有的變化都發生在32度。」
                </blockquote>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  icon: Clock,
                  title: '耐心堅持',
                  desc: '改變需要時間，最重要的是持續不斷的小進步',
                  color: 'text-blue-500'
                },
                {
                  icon: TrendingUp,
                  title: '複合增長',
                  desc: '小習慣不是簡單相加，而是複合增長',
                  color: 'text-green-500'
                },
                {
                  icon: Target,
                  title: '關注軌跡',
                  desc: '比起當前結果，更要關注習慣將你帶向何方',
                  color: 'text-purple-500'
                }
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <item.icon className={`h-12 w-12 ${item.color} mx-auto mb-4 animate-bounce`} />
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 時間規劃與習慣模板庫 */}
        {selectedSection === 'time-planner' && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">智慧時間規劃 & 習慣模板</h2>
              <p className="text-xl text-gray-600">視覺化規劃你的一周時間，並從模板庫選擇合適的習慣</p>
            </div>

            {/* 類別篩選 - 移到頂部 */}
            <div className="text-center">
              <h3 className="text-lg md:text-xl font-semibold mb-4">按類別瀏覽習慣模板</h3>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
                {allCategories.map((category) => (
                  <Badge 
                    key={category} 
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category 
                        ? 'bg-indigo-500 text-white shadow-md' 
                        : 'hover:bg-indigo-100'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 週間計劃表 */}
            <Card className="p-4 md:p-6">
              <CardHeader className="px-0">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    一週時間規劃
                  </div>
                  <span className="mt-2 sm:mt-0 sm:ml-4 text-xs sm:text-sm text-gray-500">（選擇天數，然後拖拽習慣到時間軸上）</span>
                </CardTitle>
                
                {/* 天數選擇 */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {weekDays.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDay(day.id)}
                      className={`px-3 md:px-4 py-2 rounded-lg transition-all duration-300 text-sm md:text-base ${
                        selectedDay === day.id
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="sm:hidden">{day.short}</span>
                      <span className="hidden sm:inline">{day.name}</span>
                    </button>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold text-lg">{weekDays.find(d => d.id === selectedDay)?.name}的時間安排</h4>
                </div>
                
                {/* 24小時時間條圖 */}
                <div className="relative overflow-x-auto">
                  <div className="flex border rounded-lg overflow-hidden min-w-full" style={{ height: '200px', minWidth: '800px' }}>
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="flex-1 border-r border-gray-200 relative cursor-pointer hover:bg-gray-50 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, hour)}
                      >
                        {/* 小時標記 */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 mb-1">
                          {hour.toString().padStart(2, '0')}
                        </div>
                        
                        {/* 15分鐘網格線 */}
                        <div className="absolute inset-0" style={{ top: '20px', bottom: '20px' }}>
                          {[0.25, 0.5, 0.75].map((fraction, idx) => (
                            <div
                              key={idx}
                              className="absolute inset-x-0 border-t border-gray-100"
                              style={{ top: `${fraction * 100}%` }}
                            />
                          ))}
                        </div>
                        
                        {/* 時間塊 */}
                        {getCurrentDayBlocks()
                          .filter(block => {
                            return (block.startHour < hour + 1 && block.endHour > hour);
                          })
                          .map(block => {
                            // 計算在當前小時格子內的位置和高度
                            const hourStart = hour;
                            const hourEnd = hour + 1;
                            const blockStart = Math.max(block.startHour, hourStart);
                            const blockEnd = Math.min(block.endHour, hourEnd);
                            const blockDurationInHour = blockEnd - blockStart;
                            const startPositionInHour = blockStart - hourStart;
                            
                            // 200px 是時間軸總高度，20px 是底部預留空間
                            const availableHeight = 200;
                            const blockHeight = blockDurationInHour * availableHeight;
                            const topPosition = startPositionInHour * availableHeight + 20;
                            
                            // 格式化時間顯示
                            const formatTime = (time: number) => {
                              const h = Math.floor(time);
                              const m = Math.round((time - h) * 60);
                              return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                            };
                            
                            return (
                              <div
                                key={block.id}
                                className="absolute inset-x-0 rounded text-white text-xs p-1 flex flex-col justify-center items-center transition-all duration-300 hover:opacity-80 cursor-pointer group"
                                style={{
                                  backgroundColor: block.color,
                                  height: `${blockHeight}px`,
                                  top: `${topPosition}px`
                                }}
                                title={`${block.activity} (${formatTime(block.startHour)}-${formatTime(block.endHour)})`}
                                onClick={() => setEditingBlock(block.id)}
                              >
                                <span className="font-semibold text-center leading-tight">
                                  {block.activity.length > 6 ? `${block.activity.substring(0, 4)}...` : block.activity}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTimeBlock(block.id);
                                  }}
                                  className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            );
                          })
                        }
                      </div>
                    ))}
                  </div>
                  
                  {/* 圖例 */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">活動類別</h4>
                    <div className="flex flex-wrap gap-3">
                      {timeCategories.map(category => (
                        <div key={category.name} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded mr-2" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-xs">{category.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 編輯時間塊對話框 */}
                  {editingBlock && (() => {
                    const block = getCurrentDayBlocks().find(b => b.id === editingBlock);
                    if (!block) return null;
                    
                    const formatTimeForInput = (time: number) => {
                      const h = Math.floor(time);
                      const m = Math.round((time - h) * 60);
                      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    };
                    
                    const parseTimeFromInput = (timeStr: string) => {
                      const [hours, minutes] = timeStr.split(':').map(Number);
                      return hours + (minutes || 0) / 60;
                    };
                    
                    return (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-96 max-w-[90vw]">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              編輯活動
                              <button
                                onClick={() => setEditingBlock(null)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">活動名稱</label>
                              <Input
                                defaultValue={block.activity}
                                id="activity-name"
                                placeholder="輸入活動名稱"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">開始時間</label>
                                <Input
                                  type="time"
                                  defaultValue={formatTimeForInput(block.startHour)}
                                  id="start-time"
                                  step="900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">結束時間</label>
                                <Input
                                  type="time"
                                  defaultValue={formatTimeForInput(block.endHour)}
                                  id="end-time"
                                  step="900"
                                />
                              </div>
                            </div>
                            <div className="flex space-x-2 pt-4">
                              <Button
                                onClick={() => {
                                  const activityInput = document.getElementById('activity-name') as HTMLInputElement;
                                  const startInput = document.getElementById('start-time') as HTMLInputElement;
                                  const endInput = document.getElementById('end-time') as HTMLInputElement;
                                  
                                  if (activityInput && startInput && endInput) {
                                    const newStartHour = parseTimeFromInput(startInput.value);
                                    const newEndHour = parseTimeFromInput(endInput.value);
                                    const newActivity = activityInput.value;
                                    
                                    if (newEndHour > newStartHour) {
                                      editTimeBlock(block.id, newStartHour, newEndHour, newActivity);
                                    }
                                  }
                                }}
                                className="flex-1"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                確認
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingBlock(null)}
                                className="flex-1"
                              >
                                取消
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* 習慣模板庫 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* 左側：習慣模板 */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">習慣模板庫</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl group-hover:animate-bounce">{template.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold group-hover:text-indigo-600 transition-colors">
                                {template.name}
                              </h4>
                              <p className="text-sm text-gray-600">{template.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <Input
                                  type="number"
                                  value={template.duration}
                                  onChange={(e) => {
                                    const newDuration = parseInt(e.target.value) || 0;
                                    setHabitTemplates(prev => prev.map(t => 
                                      t.id === template.id 
                                        ? { ...t, duration: newDuration, timeRequired: `${newDuration}分鐘` }
                                        : t
                                    ));
                                  }}
                                  className="w-16 h-6 text-xs px-1"
                                  min="1"
                                  max="480"
                                />
                                <span className="text-xs text-gray-400">分鐘</span>
                                <Badge variant={
                                  template.difficulty === '簡單' ? 'secondary' :
                                  template.difficulty === '中等' ? 'default' : 'destructive'
                                } className="text-xs">
                                  {template.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Grip className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                            <Button 
                              onClick={() => addHabit(template)}
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              加入
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 右側：時間分析 */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">時間使用分析</h3>
                
                {/* 平日與假日圓餅圖 */}
                <div className="grid grid-cols-2 gap-4">
                  {/* 平日圓餅圖 */}
                  <Card className="p-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">平日時間分配</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative w-32 h-32 mx-auto">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {(() => {
                            let startAngle = 0;
                            const total = timeCategories.reduce((sum, cat) => sum + cat.weekdayMinutes, 0);
                            
                            return timeCategories.map((category, index) => {
                              const percentage = category.weekdayMinutes / total;
                              const angle = percentage * 360;
                              const endAngle = startAngle + angle;
                              
                              const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                              const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                              const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                              const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                              
                              const largeArcFlag = angle > 180 ? 1 : 0;
                              const pathData = [
                                'M', 100, 100,
                                'L', x1, y1,
                                'A', 80, 80, 0, largeArcFlag, 1, x2, y2,
                                'Z'
                              ].join(' ');
                              
                              const result = (
                                <path
                                  key={index}
                                  d={pathData}
                                  fill={category.color}
                                  stroke="white"
                                  strokeWidth="2"
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                  title={`${category.name}: ${Math.round(percentage * 100)}%`}
                                />
                              );
                              
                              startAngle = endAngle;
                              return result;
                            });
                          })()}
                        </svg>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 假日圓餅圖 */}
                  <Card className="p-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">假日時間分配</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative w-32 h-32 mx-auto">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {(() => {
                            let startAngle = 0;
                            const total = timeCategories.reduce((sum, cat) => sum + cat.weekendMinutes, 0);
                            
                            return timeCategories.map((category, index) => {
                              const percentage = category.weekendMinutes / total;
                              const angle = percentage * 360;
                              const endAngle = startAngle + angle;
                              
                              const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                              const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                              const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                              const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                              
                              const largeArcFlag = angle > 180 ? 1 : 0;
                              const pathData = [
                                'M', 100, 100,
                                'L', x1, y1,
                                'A', 80, 80, 0, largeArcFlag, 1, x2, y2,
                                'Z'
                              ].join(' ');
                              
                              const result = (
                                <path
                                  key={index}
                                  d={pathData}
                                  fill={category.color}
                                  stroke="white"
                                  strokeWidth="2"
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                  title={`${category.name}: ${Math.round(percentage * 100)}%`}
                                />
                              );
                              
                              startAngle = endAngle;
                              return result;
                            });
                          })()}
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 時間統計 */}
                <Card className="p-4">
                  <CardHeader>
                    <CardTitle className="text-sm">時間使用洞察</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-lg font-bold text-blue-600">8h</div>
                        <div className="text-xs text-gray-600">平均工作</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-lg font-bold text-green-600">1h</div>
                        <div className="text-xs text-gray-600">學習時間</div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <div className="text-lg font-bold text-purple-600">8h</div>
                        <div className="text-xs text-gray-600">睡眠時間</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 text-sm mb-1">🎯 改進建議</h4>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• 考慮增加運動時間至每日30分鐘</li>
                        <li>• 可將通勤時間用於學習</li>
                        <li>• 建議固定作息時間提升效率</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* 操作提示 */}
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                      <Move className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        💡 拖拽左側習慣模板到時間軸上安排時間
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 text-sm mb-2">✨ 精確時間管理</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• 同一小時內可安排多個活動（如：13:00-13:15 學習，13:15-14:00 工作）</li>
                      <li>• 點擊任何時間塊可編輯活動名稱和時間長度</li>
                      <li>• 拖拽時會自動找到最近的可用時間段</li>
                      <li>• 支援15分鐘精度的時間安排</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 text-sm mb-2">🎯 個人化設定</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• 可調整左側習慣模板的時間長度</li>
                      <li>• 每天可設定不同的作息安排</li>
                      <li>• 所有預設時間（工作、睡覺、用餐）都可修改</li>
                      <li>• 週末和平日可有不同的時間規劃</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 習慣追蹤器 */}
        {selectedSection === 'tracker' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">習慣追蹤器</h2>
              <p className="text-xl text-gray-600">追蹤進度，建立持續動力</p>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              {[
                { label: '活躍習慣', value: habits.filter(h => h.isActive).length, icon: Target, color: 'text-blue-500' },
                { label: '今日完成', value: habits.filter(h => isCompletedToday(h)).length, icon: CheckCircle2, color: 'text-green-500' },
                { label: '最長連續', value: Math.max(...habits.map(h => h.streak), 0), icon: Award, color: 'text-yellow-500' },
                { label: '總完成次數', value: habits.reduce((acc, h) => acc + h.completedDates.length, 0), icon: BarChart3, color: 'text-purple-500' }
              ].map((stat, index) => (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6">
                    <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 習慣列表 */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold mb-4">我的習慣</h3>
              {habits.length === 0 ? (
                <Card className="text-center p-12">
                  <CardContent>
                    <Circle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">還沒有任何習慣，去習慣計劃或時間規劃添加一些吧！</p>
                  </CardContent>
                </Card>
              ) : (
                habits.map((habit) => (
                  <Card key={habit.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => completeHabit(habit.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                isCompletedToday(habit) 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {isCompletedToday(habit) && <Check className="h-4 w-4" />}
                            </button>
                            <div>
                              <h4 className="text-lg font-semibold">{habit.name}</h4>
                              <p className="text-sm text-gray-600">{habit.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-500">{habit.streak}</div>
                            <div className="text-xs text-gray-500">連續天數</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-500">{getCompletionRate(habit)}%</div>
                            <div className="text-xs text-gray-500">完成率</div>
                          </div>
                          <Badge variant="secondary">{habit.category}</Badge>
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* 習慣計劃 */}
        {selectedSection === 'planner' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">習慣計劃</h2>
              <p className="text-xl text-gray-600">制定個人化的習慣養成計劃</p>
            </div>

            <Card className="max-w-2xl mx-auto hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  創建新習慣
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">習慣名稱</label>
                  <Input
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="例如：每天閱讀15分鐘"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">習慣描述</label>
                  <Textarea
                    value={newHabitDesc}
                    onChange={(e) => setNewHabitDesc(e.target.value)}
                    placeholder="詳細描述這個習慣的內容和意義"
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={() => addHabit()}
                  disabled={!newHabitName.trim()}
                  className="w-full transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  創建習慣
                </Button>
              </CardContent>
            </Card>

            {/* 習慣計劃建議 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <Card className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-green-600">🎯 習慣設計原則</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">從小習慣開始，每天只需2分鐘</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">與現有習慣疊加，建立清晰的觸發機制</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">設計環境，讓好習慣顯而易見</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm">專注於身份認同，成為那種人</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-blue-600">📅 計劃制定步驟</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <p className="text-sm">明確目標身份：我想成為什麼樣的人？</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <p className="text-sm">選擇支撐身份的小習慣</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <p className="text-sm">設定實施意圖：何時何地執行</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <p className="text-sm">追蹤進度並慶祝小勝利</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}
