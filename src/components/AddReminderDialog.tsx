import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface AddReminderDialogProps {
  onAdd: (reminder: {
    title: string;
    description?: string;
    reminder_date: string;
    reminder_time?: string;
    notification_enabled: boolean;
  }) => void;
}

const AddReminderDialog = ({ onAdd }: AddReminderDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date) return;

    onAdd({
      title,
      description: description || undefined,
      reminder_date: date,
      reminder_time: time || undefined,
      notification_enabled: notificationEnabled,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setNotificationEnabled(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          {t('addReminder')}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-white/20">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t('addReminder')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">{t('title')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('title')}
              required
              className="glass border-white/10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">{t('description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('description')}
              className="glass border-white/10"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">{t('date')}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="glass border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="text-foreground">{t('time')}</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="glass border-white/10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 glass rounded-lg border border-white/10">
            <Label htmlFor="notification" className="text-foreground text-sm">
              {t('enableNotification')}
            </Label>
            <Switch
              id="notification"
              checked={notificationEnabled}
              onCheckedChange={setNotificationEnabled}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 glass border-white/10"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary text-primary-foreground shadow-glow"
            >
              {t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderDialog;
