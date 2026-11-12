import { useState } from 'react';

import { Choice } from '@/components/ui';
import { useT, type StringKey } from '@/lib/i18n';
import { EVENT_GROUPS, EVENT_NAMES, EVENTS, type EventGroup } from '@/lib/schools';

/** Picks an event in two taps: first the kind of event, then the event itself. */
export function EventPicker({ label, value, onChange }: { label?: string; value: string; onChange: (ev: string) => void }) {
  const { t, ev } = useT();
  const [group, setGroup] = useState<EventGroup>(EVENTS[value]?.group ?? 'sprints');
  return (
    <>
      <Choice
        label={label}
        value={group}
        onChange={setGroup}
        options={EVENT_GROUPS.map((g) => ({ value: g, label: t(`g_${g}` as StringKey) }))}
      />
      <Choice
        value={value}
        onChange={onChange}
        options={EVENT_NAMES.filter((e) => EVENTS[e].group === group).map((e) => ({ value: e, label: ev(e) }))}
      />
    </>
  );
}
