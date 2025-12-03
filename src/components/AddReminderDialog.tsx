import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import TimePickerWheel from '@/components/TimePickerWheel';
import { toast } from 'sonner';

interface AddReminderDialogProps {
  onAdd: (reminder: {
    title: string;
    description?: string;
    reminder_date: string;
    reminder_time?: string;
    notification_enabled: boolean;
    notification_delay: number;
  }) => void;
  onSuccess?: () => void;
}

const AddReminderDialog = ({ onAdd, onSuccess }: AddReminderDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationDelay, setNotificationDelay] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || trimmedTitle.length > 100) {
      toast.error("Le titre est requis et doit contenir maximum 100 caractères");
      return;
    }

    if (trimmedDescription.length > 1000) {
      toast.error("La description doit contenir maximum 1000 caractères");
      return;
    }

    if (!date || isNaN(Date.parse(date))) {
      toast.error("Date invalide");
      return;
    }

    onAdd({
      title: trimmedTitle,
      description: trimmedDescription || undefined,
      reminder_date: date,
      reminder_time: time || undefined,
      notification_enabled: notificationEnabled,
      notification_delay: parseInt(notificationDelay),
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setNotificationEnabled(true);
    setNotificationDelay('0');
    setOpen(false);
    
    // Call success callback to close parent collapsible
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          {t('addReminder')}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-white/20 max-h-[70vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-foreground">{t('addReminder')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
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
              className="glass border-white/10 resize-none"
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
              <TimePickerWheel value={time} onChange={setTime} />
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

          {notificationEnabled && (
            <div className="space-y-2">
              <Label htmlFor="delay" className="text-foreground">{t('notificationDelay')}</Label>
              <Select value={notificationDelay} onValueChange={setNotificationDelay}>
                <SelectTrigger className="glass border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong">
                  <SelectItem value="0">{t('notifyAtTime')}</SelectItem>
                  <SelectItem value="5">{t('notify5MinBefore')}</SelectItem>
                  <SelectItem value="15">{t('notify15MinBefore')}</SelectItem>
                  <SelectItem value="30">{t('notify30MinBefore')}</SelectItem>
                  <SelectItem value="60">{t('notify1HourBefore')}</SelectItem>
                  <SelectItem value="120">{t('notify2HoursBefore')}</SelectItem>
                  <SelectItem value="1440">{t('notify1DayBefore')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-background pb-2">
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
