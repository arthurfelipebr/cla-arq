
import React from 'react';
import { Card } from '../components/common/Card';
import { Project, Task, Inspection, Payment, ProjectStatus, TaskStatus, PaymentStatus, InspectionStatus } from '../types'; // Added InspectionStatus
import { AlertTriangle, CalendarCheck, CheckCircle, Clock, DollarSignIcon, ListChecksIcon, Briefcase } from 'lucide-react';
import { Button } from '../components/common/Button';

interface DashboardPageProps {
  projects: Project[];
  tasks: Task[]; // Assuming these are all tasks (global + project-specific)
  inspections: Inspection[];
  payments: Payment[]; // All payments from all projects
  navigateTo: (path: string) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  // Check if dateString is already in DD/MM/YYYY format by mistake
  if (/\d{2}\/\d{2}\/\d{4}/.test(dateString)) return dateString;
  
  const date = new Date(dateString);
   // If it's just a date (YYYY-MM-DD), treat it as local to avoid timezone shifts for display
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  return date.toLocaleDateString('pt-BR');
};


const isDateInThisWeek = (date: Date): boolean => {
  const today = new Date();
  const todayDay = today.getDay(); // 0 (Sun) - 6 (Sat)
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - todayDay + (todayDay === 0 ? -6 : 1)); // Adjust for Sunday as start or Mon
  firstDayOfWeek.setHours(0, 0, 0, 0);

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999);
  
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
};

const isDateUpcomingOrOverdue = (dateStr: string, daysThreshold = 7): { type: 'overdue' | 'upcoming' | 'none', daysDiff: number } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    let itemDateObject: Date;
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) { 
        const [year, month, day] = dateStr.split('-').map(Number);
        itemDateObject = new Date(year, month - 1, day); 
    } else { 
        itemDateObject = new Date(dateStr);
    }
    itemDateObject.setHours(0, 0, 0, 0); 

    const diffTime = itemDateObject.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { type: 'overdue', daysDiff: Math.abs(diffDays) };
    if (diffDays <= daysThreshold) return { type: 'upcoming', daysDiff: diffDays };
    return { type: 'none', daysDiff: diffDays };
};


export const DashboardPage: React.FC<DashboardPageProps> = ({ projects, tasks, inspections, payments, navigateTo }) => {
  const activeProjects = projects.filter(p => p.status === ProjectStatus.ONGOING || p.status === ProjectStatus.PLANNING).length;
  
  const tasksThisWeek = tasks.filter(t => {
    if (!t.due_date || t.status === TaskStatus.COMPLETED) return false;
    
    let dueDateObj: Date;
    if (t.due_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = t.due_date.split('-').map(Number);
        dueDateObj = new Date(year, month - 1, day); // Create as local date
    } else {
        dueDateObj = new Date(t.due_date); // Parse other formats (e.g., ISO string)
    }
    // isDateInThisWeek compares Date objects directly.
    return isDateInThisWeek(dueDateObj);
  }).length;

  const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.OVERDUE);
  const totalPendingValue = pendingPayments.reduce((sum, p) => sum + p.value, 0);

  const importantNotices: Array<{ type: 'project' | 'task' | 'inspection' | 'payment'; item: any; message: string; urgency: 'danger' | 'warning' | 'info'; icon: React.ReactNode, path?: string }> = [];

  // Overdue/Upcoming Projects
  projects.forEach(p => {
    if (p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.CANCELED && p.due_date) {
      const { type, daysDiff } = isDateUpcomingOrOverdue(p.due_date, 7);
      if (type === 'overdue') {
        importantNotices.push({ type: 'project', item: p, message: `Projeto "${p.name}" está ${daysDiff} dia(s) atrasado. Entrega: ${formatDate(p.due_date)}`, urgency: 'danger', icon: <Briefcase size={16}/>, path: `/projects/${p.id}` });
      } else if (type === 'upcoming') {
        importantNotices.push({ type: 'project', item: p, message: `Projeto "${p.name}" vence em ${daysDiff} dia(s). Entrega: ${formatDate(p.due_date)}`, urgency: 'warning', icon: <Briefcase size={16}/>, path: `/projects/${p.id}` });
      }
    }
  });

  // Overdue/Upcoming Tasks
  tasks.forEach(t => {
    if (t.status !== TaskStatus.COMPLETED && t.due_date) {
      const { type, daysDiff } = isDateUpcomingOrOverdue(t.due_date, 3); // Shorter threshold for tasks
      const projectInfo = t.projectId ? `(${projects.find(p=>p.id === t.projectId)?.name || 'Projeto'}) ` : '';
      if (type === 'overdue') {
        importantNotices.push({ type: 'task', item: t, message: `Tarefa ${projectInfo}"${t.title}" está ${daysDiff} dia(s) atrasada. Prazo: ${formatDate(t.due_date)}`, urgency: 'danger', icon: <ListChecksIcon size={16}/>, path: '/tasks' });
      } else if (type === 'upcoming' && daysDiff <=3) {
        importantNotices.push({ type: 'task', item: t, message: `Tarefa ${projectInfo}"${t.title}" vence em ${daysDiff} dia(s). Prazo: ${formatDate(t.due_date)}`, urgency: 'warning', icon: <ListChecksIcon size={16}/>, path: '/tasks' });
      }
    }
  });
  
  // Overdue/Upcoming Inspections
   inspections.forEach(i => {
    if (i.status !== InspectionStatus.COMPLETED && i.status !== InspectionStatus.CANCELED && i.due_date) {
      const { type, daysDiff } = isDateUpcomingOrOverdue(i.due_date, 7);
      if (type === 'overdue') {
        importantNotices.push({ type: 'inspection', item: i, message: `Inspeção "${i.identifier}" está ${daysDiff} dia(s) atrasada. Prazo: ${formatDate(i.due_date)}`, urgency: 'danger', icon: <CalendarCheck size={16}/>, path: '/inspections'});
      } else if (type === 'upcoming') {
        importantNotices.push({ type: 'inspection', item: i, message: `Inspeção "${i.identifier}" vence em ${daysDiff} dia(s). Prazo: ${formatDate(i.due_date)}`, urgency: 'warning', icon: <CalendarCheck size={16}/>, path: '/inspections'});
      }
    }
  });

  // Overdue Payments
  pendingPayments.filter(p=> p.status === PaymentStatus.OVERDUE).forEach(p => {
     const { daysDiff } = isDateUpcomingOrOverdue(p.due_date);
     importantNotices.push({ type: 'payment', item: p, message: `Pagamento "${p.description}" (${p.projectName}) está ${daysDiff} dia(s) vencido. Venc: ${formatDate(p.due_date)}`, urgency: 'danger', icon: <DollarSignIcon size={16}/>, path: p.project_id ? `/projects/${p.project_id}` : '/finances' });
  });


  // Sort notices: danger first, then warning, then by daysDiff (smaller is more urgent)
  importantNotices.sort((a, b) => {
    if (a.urgency === 'danger' && b.urgency !== 'danger') return -1;
    if (a.urgency !== 'danger' && b.urgency === 'danger') return 1;
    if (a.urgency === 'warning' && b.urgency === 'info') return -1;
    if (a.urgency === 'info' && b.urgency === 'warning') return 1;
    
    const aItemDate = a.item.due_date || a.item.scheduled_date;
    const bItemDate = b.item.due_date || b.item.scheduled_date;

    // Handle cases where dates might be missing for some items, though unlikely for "importantNotices"
    if (!aItemDate && bItemDate) return 1; // items without dates go last
    if (aItemDate && !bItemDate) return -1;
    if (!aItemDate && !bItemDate) return 0;


    const aDays = isDateUpcomingOrOverdue(aItemDate).daysDiff;
    const bDays = isDateUpcomingOrOverdue(bItemDate).daysDiff;
    
    if(a.urgency === 'danger') return aDays > bDays ? -1 : 1; // more days overdue is more urgent
    return aDays < bDays ? -1 : 1; // fewer days upcoming is more urgent
  });


  const StatCard: React.FC<{title: string, value: string | number, subtext?: string, icon: React.ReactNode, onClick?: () => void, colorClass?: string}> = 
    ({title, value, subtext, icon, onClick, colorClass = 'text-clarissa-primary'}) => (
    <Card title={title} onClick={onClick} className={onClick ? 'hover:bg-clarissa-background/30' : ''}>
      <div className="flex items-center justify-between">
        <p className={`text-3xl font-semibold ${colorClass}`}>{value}</p>
        <div className={`p-2 rounded-full bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>{icon}</div>
      </div>
      {subtext && <p className="text-sm text-clarissa-secondary mt-1">{subtext}</p>}
    </Card>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-clarissa-dark mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Projetos Ativos" value={activeProjects} subtext="Em planejamento ou execução." icon={<Briefcase size={24}/>} onClick={() => navigateTo('/projects')} />
        <StatCard title="Tarefas da Semana" value={tasksThisWeek} subtext="Com prazo para esta semana." icon={<ListChecksIcon size={24}/>} onClick={() => navigateTo('/tasks')} />
        <StatCard title="Pagamentos Pendentes" value={`R$ ${totalPendingValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} subtext="Total a receber." icon={<DollarSignIcon size={24}/>} colorClass="text-clarissa-accent" onClick={() => navigateTo('/finances')} />
        
        {importantNotices.length > 0 && (
            <Card title="Avisos Importantes" className="md:col-span-2 lg:col-span-3">
            <ul className="space-y-3 max-h-96 overflow-y-auto clarissa-scrollbar pr-2">
                {importantNotices.slice(0, 10).map((notice, index) => ( // Show max 10 notices
                <li key={index} className={`text-sm flex items-start p-2 rounded-md ${notice.urgency === 'danger' ? 'bg-red-50 text-red-700' : notice.urgency === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                    <span className="mr-2 mt-0.5">{notice.icon}</span>
                    <div className="flex-grow">
                        {notice.message}
                        {notice.path && (
                            <Button variant="link" size="sm" onClick={() => navigateTo(notice.path!)} className="ml-2 !p-0 !text-xs !font-medium">
                                Ver Detalhes
                            </Button>
                        )}
                    </div>
                </li>
                ))}
            </ul>
            </Card>
        )}
         {importantNotices.length === 0 && (
             <Card title="Avisos Importantes" className="md:col-span-2 lg:col-span-3">
                <div className="flex items-center text-clarissa-success p-3">
                    <CheckCircle size={20} className="mr-3"/>
                    <p>Tudo em dia! Nenhum aviso urgente no momento.</p>
                </div>
            </Card>
         )}
      </div>
    </div>
  );
};
