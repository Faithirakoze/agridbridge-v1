import { useMemo, useState } from 'react';
import { FeedIcon, HealthIcon, MarketIcon, ProductionIcon, RecordIcon } from '../components/AppIcon';
import { useStore } from '../store/useStore';

const animals = [
  { id: 'C-014', name: 'Bella', group: 'Dairy cows', status: 'healthy', vaccine: '2026-06-02' },
  { id: 'C-021', name: 'Aline', group: 'Dairy cows', status: 'at risk', vaccine: '2026-05-24' },
  { id: 'G-008', name: 'Musanze', group: 'Goats', status: 'sick', vaccine: '2026-05-28' },
  { id: 'C-033', name: 'Imena', group: 'Heifers', status: 'healthy', vaccine: '2026-06-12' },
];

const productionTrend = [38, 42, 40, 45, 47, 44, 49, 52, 50, 55, 57, 54, 60, 64, 62];
const profitTrend = [420, 510, 460, 590, 640, 610, 720, 780];
const targetTrend = [58, 62, 60, 66, 70, 68, 72];
const panelClass = 'bg-gradient-to-br from-white to-gray-50/70 border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/60';
const softPanelClass = 'bg-white/90 border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/60';
const accentPalette = [
  'border-l-emerald-500 bg-emerald-50/35',
  'border-l-amber-500 bg-amber-50/35',
  'border-l-sky-500 bg-sky-50/35',
  'border-l-rose-500 bg-rose-50/35',
];

const TEXT = {
  en: {
    livestock_label: 'Livestock farming',
    animals: 'Animals',
    feed: 'Feed',
    revenue: 'Revenue',
    days_30: '30 days',
    today: 'Today',
    dismiss: 'Dismiss',
    snooze: 'Snooze',
    no_active_reminders: 'No active reminders.',
    dashboard_title: 'Livestock dashboard',
    dashboard_subtitle: 'A single operating view for herd health, feed, production, money, and urgent work.',
    dashboard_alert_vaccines: '2 vaccinations are overdue',
    dashboard_alert_feed: 'Dairy meal stock below reorder level',
    kpi_herd: 'Total herd count',
    kpi_herd_hint: '12 new this season',
    kpi_vaccination: 'Due for vaccination',
    kpi_vaccination_hint: '2 overdue',
    kpi_feed: 'Feed stock level',
    kpi_feed_hint: 'Low stock',
    kpi_revenue: 'Monthly revenue',
    kpi_revenue_hint: '+14% vs last month',
    quick_actions: 'Quick actions',
    recent_events: 'Recent farm events',
    action_health: 'Log health event',
    action_birth: 'Record birth',
    action_expense: 'Add expense',
    activity_vaccination: 'Vaccination completed for Bella',
    activity_birth: 'Twin goats born in Group B',
    activity_feed: 'Dairy meal restocked: 600 kg',
    activity_health_added: 'Health event logged for at-risk animals',
    activity_birth_added: 'Birth recorded for calf C-041',
    activity_expense_added: 'Expense added under feed category',
    milk_yield_trend: 'Milk yield trend',
    health_title: 'Health & vaccination',
    health_subtitle: 'Monitor animal health, due vaccines, treatments, and vet visit history.',
    animal_list: 'Animal list',
    vaccination_schedule: 'Vaccination schedule',
    health_form_title: 'Log health event or treatment',
    animal: 'Animal',
    event_type: 'Event type',
    date: 'Date',
    notes: 'Notes',
    notes_placeholder: 'Dose, symptoms, or vet recommendation',
    save_health_event: 'Save health event',
    vet_history: 'Vet visit history',
    status_healthy: 'healthy',
    status_at_risk: 'at risk',
    status_sick: 'sick',
    status_urgent: 'urgent',
    status_upcoming: 'upcoming',
    status_info: 'info',
    status_overdue: 'overdue',
    status_ok: 'ok',
    treatment: 'Treatment',
    vaccination: 'Vaccination',
    checkup: 'Checkup',
    injury: 'Injury',
    feed_title: 'Feed & nutrition',
    feed_subtitle: 'Track stock, consumption, herd feeding routines, and new feed deliveries.',
    feed_inventory: 'Feed inventory',
    daily_consumption: 'Daily consumption tracker',
    feed_schedule: 'Feed schedule planner',
    record_feed_delivery: 'Record feed delivery',
    feed_item: 'Feed item',
    quantity_kg: 'Quantity (kg)',
    supplier: 'Supplier',
    save_delivery: 'Save delivery',
    breeding_title: 'Breeding & reproduction',
    breeding_subtitle: 'Manage pairing records, pregnancies, expected calving, and calving history.',
    pairing_records: 'Pairing records',
    pregnancy_tracking: 'Pregnancy tracking',
    calving_history: 'Calving history',
    cow: 'Cow',
    bull: 'Bull',
    breeding_date: 'Breeding date',
    record_breeding: 'Record breeding',
    finances_title: 'Finances',
    finances_subtitle: 'Review income, expenses, P&L, and transaction categories.',
    income: 'Income',
    expenses: 'Expenses',
    net_profit: 'Net profit',
    monthly_pl: 'Monthly P&L',
    add_transaction: 'Add transaction',
    category: 'Category',
    note: 'Note',
    amount_rwf: 'Amount (RWF)',
    transaction_log: 'Transaction log',
    inventory_title: 'Inventory & equipment',
    inventory_subtitle: 'Track supplies, medicines, equipment service dates, and maintenance logs.',
    supplies_medicines: 'Supplies and medicines',
    maintenance_schedule: 'Maintenance schedule',
    stock_equipment: 'Stock or equipment',
    update_detail: 'Update detail',
    save_update: 'Save update',
    production_title: 'Production & yield',
    production_subtitle: 'Record milk or meat yield, herd weights, targets, and actual performance.',
    yield_log: 'Daily and weekly yield log',
    weight_tracking: 'Herd weight tracking',
    targets_actuals: 'Targets vs actuals',
    production_entry: 'Record production entry',
    product: 'Product',
    quantity: 'Quantity',
    unit: 'Unit',
    save_production: 'Save production',
    alerts_title: 'Alerts & reminders',
    alerts_subtitle: 'All upcoming and overdue vaccinations, calvings, equipment service, and feed reorders.',
    task_list: 'Task list',
  },
  rw: {
    livestock_label: 'Ubworozi',
    animals: 'Amatungo',
    feed: 'Ibiryo',
    revenue: 'Amafaranga yinjiye',
    days_30: 'Iminsi 30',
    today: 'Uyu munsi',
    dismiss: 'Kuraho',
    snooze: 'Subika',
    no_active_reminders: 'Nta byibutsa bihari.',
    dashboard_title: 'Ahabanza h ubworozi',
    dashboard_subtitle: 'Reba hamwe ubuzima bw amatungo, ibiryo, umusaruro, imari, n ibyihutirwa.',
    dashboard_alert_vaccines: 'Inkingo 2 zararengeje igihe',
    dashboard_alert_feed: 'Ibiryo bya dairy meal biri munsi y igipimo cyo kongera kugura',
    kpi_herd: 'Umubare w amatungo',
    kpi_herd_hint: '12 mashya muri iki gihembwe',
    kpi_vaccination: 'Ategereje gukingirwa',
    kpi_vaccination_hint: '2 yarengeje igihe',
    kpi_feed: 'Urwego rw ibiryo bihari',
    kpi_feed_hint: 'Ibiryo ni bike',
    kpi_revenue: 'Amafaranga y ukwezi',
    kpi_revenue_hint: '+14% ugereranyije n ukwezi gushize',
    quick_actions: 'Ibikorwa byihuse',
    recent_events: 'Ibikorwa biheruka mu bworozi',
    action_health: 'Andika ikibazo cy ubuzima',
    action_birth: 'Andika ivuka',
    action_expense: 'Ongeraho ikiguzi',
    activity_vaccination: 'Bella yakingiwe',
    activity_birth: 'Ihene z impanga zavukiye mu Itsinda B',
    activity_feed: 'Dairy meal yongewemo: 600 kg',
    activity_health_added: 'Ikibazo cy ubuzima cyanditswe ku matungo ari mu kaga',
    activity_birth_added: 'Ivuka rya C-041 ryanditswe',
    activity_expense_added: 'Ikiguzi cyanditswe mu cyiciro cy ibiryo',
    milk_yield_trend: 'Uko amata agenda yiyongera',
    health_title: 'Ubuzima n inkingo',
    health_subtitle: 'Kurikirana ubuzima bw amatungo, inkingo zitegerejwe, imiti, n amateka yo gusura umuganga.',
    animal_list: 'Urutonde rw amatungo',
    vaccination_schedule: 'Gahunda y inkingo',
    health_form_title: 'Andika ubuzima cyangwa umuti',
    animal: 'Itungo',
    event_type: 'Ubwoko bw igikorwa',
    date: 'Itariki',
    notes: 'Ibisobanuro',
    notes_placeholder: 'Ingano y umuti, ibimenyetso, cyangwa inama za muganga',
    save_health_event: 'Bika igikorwa cy ubuzima',
    vet_history: 'Amateka yo gusura muganga',
    status_healthy: 'rifite ubuzima bwiza',
    status_at_risk: 'riri mu kaga',
    status_sick: 'rirarwaye',
    status_urgent: 'cyihutirwa',
    status_upcoming: 'kiraje',
    status_info: 'amakuru',
    status_overdue: 'cyarengeje igihe',
    status_ok: 'ni byiza',
    treatment: 'Umuti',
    vaccination: 'Urukingo',
    checkup: 'Isuzuma',
    injury: 'Igikomere',
    feed_title: 'Ibiryo n imirire',
    feed_subtitle: 'Kurikirana ibiryo bihari, ibyo amatungo arya, gahunda yo kugaburira, n ibiryo bishya byageze.',
    feed_inventory: 'Ububiko bw ibiryo',
    daily_consumption: 'Ibiryo bikoreshwa buri munsi',
    feed_schedule: 'Gahunda yo kugaburira',
    record_feed_delivery: 'Andika ibiryo byageze',
    feed_item: 'Ubwoko bw ibiryo',
    quantity_kg: 'Ingano (kg)',
    supplier: 'Uwabizanye',
    save_delivery: 'Bika ibyazanywe',
    breeding_title: 'Kororoka',
    breeding_subtitle: 'Cunga guhuza ikimasa n inka, inda, amatariki yo kubyara, n amateka yo kubyara.',
    pairing_records: 'Inyandiko zo guhuza',
    pregnancy_tracking: 'Gukurikirana inda',
    calving_history: 'Amateka yo kubyara',
    cow: 'Inka',
    bull: 'Ikimasa',
    breeding_date: 'Itariki yo guhuza',
    record_breeding: 'Andika guhuza',
    finances_title: 'Imari',
    finances_subtitle: 'Reba amafaranga yinjiye, yasohotse, inyungu, n ibyiciro by ibikorwa by imari.',
    income: 'Ayinjiye',
    expenses: 'Ayasohotse',
    net_profit: 'Inyungu',
    monthly_pl: 'Inyungu n igihombo by ukwezi',
    add_transaction: 'Ongeraho igikorwa cy imari',
    category: 'Icyiciro',
    note: 'Icyitonderwa',
    amount_rwf: 'Amafaranga (RWF)',
    transaction_log: 'Inyandiko z imari',
    inventory_title: 'Ububiko n ibikoresho',
    inventory_subtitle: 'Kurikirana ibikoresho, imiti, amatariki yo gusana, n ibikorwa byo kubungabunga.',
    supplies_medicines: 'Ibikoresho n imiti',
    maintenance_schedule: 'Gahunda yo gusana',
    stock_equipment: 'Ububiko cyangwa igikoresho',
    update_detail: 'Ibisobanuro by ihinduka',
    save_update: 'Bika ihinduka',
    production_title: 'Umusaruro',
    production_subtitle: 'Andika amata cyangwa inyama, ibiro by amatungo, intego, n ibyagezweho.',
    yield_log: 'Inyandiko y umusaruro wa buri munsi n icyumweru',
    weight_tracking: 'Gukurikirana ibiro by amatungo',
    targets_actuals: 'Intego n ibyagezweho',
    production_entry: 'Andika umusaruro mushya',
    product: 'Igicuruzwa',
    quantity: 'Ingano',
    unit: 'Igipimo',
    save_production: 'Bika umusaruro',
    alerts_title: 'Amatangazo n ibyibutsa',
    alerts_subtitle: 'Inkingo, kubyara, gusana ibikoresho, no kongera kugura ibiryo byose bitegerejwe cyangwa byarengeje igihe.',
    task_list: 'Urutonde rw imirimo',
  },
};

function useLivestockText() {
  const language = useStore((state) => state.language);
  const selected = language === 'rw' ? TEXT.rw : TEXT.en;
  return (key) => selected[key] || TEXT.en[key] || key;
}

function statusClass(status) {
  const colors = {
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'at risk': 'bg-amber-50 text-amber-700 border-amber-100',
    sick: 'bg-red-50 text-red-700 border-red-100',
    urgent: 'bg-red-50 text-red-700 border-red-100',
    upcoming: 'bg-amber-50 text-amber-700 border-amber-100',
    info: 'bg-sky-50 text-sky-700 border-sky-100',
    overdue: 'bg-red-50 text-red-700 border-red-100',
    ok: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return colors[status] || colors.info;
}

function PageHeader({ title, subtitle, icon: Icon = RecordIcon }) {
  const t = useLivestockText();

  return (
    <section className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 border border-emerald-100 rounded-2xl p-5 shadow-sm shadow-emerald-100/70 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 ring-8 ring-primary/5">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="section-label mb-1">{t('livestock_label')}</p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 leading-6 mt-2 max-w-2xl">{subtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 min-w-64">
          {[
            ['86', t('animals'), 'bg-emerald-100/70 border-emerald-200 text-emerald-900'],
            ['38%', t('feed'), 'bg-amber-100/70 border-amber-200 text-amber-900'],
            ['RWF 2.4M', t('revenue'), 'bg-sky-100/70 border-sky-200 text-sky-900'],
          ].map(([value, label, tone]) => (
            <div key={label} className={`rounded-2xl border px-3 py-2 text-center ${tone}`}>
              <p className="text-sm font-semibold text-gray-900">{value}</p>
              <p className="text-[11px] opacity-70 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionPanel({ title, children, className = '' }) {
  return (
    <section className={`${panelClass} ${className}`}>
      {title && <p className="section-label">{title}</p>}
      {children}
    </section>
  );
}

function TimelineItem({ children, meta = 'Today' }) {
  const t = useLivestockText();
  const displayMeta = meta === 'Today' ? t('today') : meta;

  return (
    <div className="grid grid-cols-[10px_1fr_auto] gap-3 items-start">
      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-primary" />
      <span className="text-sm text-gray-700 leading-6">{children}</span>
      <span className="text-xs text-gray-400 whitespace-nowrap pt-1">{displayMeta}</span>
    </div>
  );
}

function Badge({ children, tone }) {
  const t = useLivestockText();
  const label = typeof children === 'string' ? t(`status_${children.replace(/\s/g, '_')}`) : children;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(tone)}`}>
      {label}
    </span>
  );
}

function MiniChart({ values, label, color = 'bg-primary' }) {
  const t = useLivestockText();
  const max = Math.max(...values, 1);
  const lastValue = values[values.length - 1];
  return (
    <div className={panelClass}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="section-label mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{lastValue}</p>
        </div>
        <span className="rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs text-gray-500">{t('days_30')}</span>
      </div>
      <div className="h-40 flex items-end gap-2 rounded-2xl bg-gray-50 p-3">
        {values.map((value, index) => (
          <div key={`${value}-${index}`} className="flex-1 rounded-t-lg overflow-hidden flex items-end">
            <div
              className={`${color} w-full rounded-t-lg shadow-sm transition-all`}
              style={{ height: `${Math.max((value / max) * 100, 10)}%` }}
              title={`${value}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 mb-1.5">{label}</span>
      <input
        className="input text-sm shadow-sm shadow-gray-100"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 mb-1.5">{label}</span>
      <select className="input text-sm shadow-sm shadow-gray-100" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>{option.label || option}</option>
        ))}
      </select>
    </label>
  );
}

function Dashboard() {
  const t = useLivestockText();
  const [activities, setActivities] = useState([
    'activity_vaccination',
    'activity_birth',
    'activity_feed',
  ]);
  const [alerts, setAlerts] = useState([
    { id: 1, text: 'dashboard_alert_vaccines', tone: 'urgent' },
    { id: 2, text: 'dashboard_alert_feed', tone: 'upcoming' },
  ]);

  function addActivity(text) {
    setActivities((items) => [text, ...items].slice(0, 6));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('dashboard_title')}
        subtitle={t('dashboard_subtitle')}
        icon={ProductionIcon}
      />

      {alerts.map((alert) => (
        <div key={alert.id} className={`border rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm ${statusClass(alert.tone)}`}>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
            <span className="text-sm font-medium">{t(alert.text)}</span>
          </div>
          <button type="button" className="text-xs font-semibold underline" onClick={() => setAlerts((items) => items.filter((item) => item.id !== alert.id))}>
            {t('dismiss')}
          </button>
        </div>
      ))}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [t('kpi_herd'), '86', t('kpi_herd_hint')],
          [t('kpi_vaccination'), '7', t('kpi_vaccination_hint')],
          [t('kpi_feed'), '38%', t('kpi_feed_hint')],
          [t('kpi_revenue'), 'RWF 2.4M', t('kpi_revenue_hint')],
        ].map(([label, value, hint], index) => (
          <div key={label} className={`${softPanelClass} border-l-4 ${accentPalette[index]}`}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
            <p className="text-xs text-gray-500 mt-2">{hint}</p>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-[1fr_1.1fr] gap-4">
        <SectionPanel title={t('quick_actions')}>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              [t('action_health'), 'activity_health_added', 'bg-rose-600 hover:bg-rose-700'],
              [t('action_birth'), 'activity_birth_added', 'bg-violet-600 hover:bg-violet-700'],
              [t('action_expense'), 'activity_expense_added', 'bg-sky-600 hover:bg-sky-700'],
            ].map(([label, activity, color]) => (
              <button
                key={label}
                type="button"
                className={`w-full text-white font-medium py-3 px-4 rounded-xl active:scale-95 transition-all shadow-sm ${color}`}
                onClick={() => addActivity(activity)}
              >
                {label}
              </button>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title={t('recent_events')}>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <TimelineItem key={`${activity}-${index}`}>{t(activity)}</TimelineItem>
            ))}
          </div>
        </SectionPanel>
      </section>

      <MiniChart values={productionTrend} label={t('milk_yield_trend')} />
    </div>
  );
}

function HealthView() {
  const t = useLivestockText();
  const [events, setEvents] = useState(['2026-05-20 - Vet visit: parasite treatment', '2026-05-12 - Vaccination: blackleg']);
  const [form, setForm] = useState({ animal: 'Bella', event: 'Treatment', date: '2026-05-27', notes: '' });

  function submit(event) {
    event.preventDefault();
    setEvents((items) => [`${form.date} - ${form.event}: ${form.animal}${form.notes ? ` - ${form.notes}` : ''}`, ...items]);
    setForm({ ...form, notes: '' });
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('health_title')} subtitle={t('health_subtitle')} icon={HealthIcon} />
      <section className="grid lg:grid-cols-2 gap-4">
        <div className={`${panelClass} overflow-x-auto`}>
          <p className="section-label">{t('animal_list')}</p>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {animals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 font-medium text-gray-900">{animal.name}</td>
                  <td className="py-3 text-gray-500">{animal.group}</td>
                  <td className="py-3"><Badge tone={animal.status}>{animal.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SectionPanel title={t('vaccination_schedule')}>
          <div className="space-y-3">
            {animals.map((animal) => (
              <div key={animal.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2">
                <span className="text-sm text-gray-700">{animal.name}</span>
                <Badge tone={animal.vaccine < '2026-05-27' ? 'overdue' : 'upcoming'}>{animal.vaccine}</Badge>
              </div>
            ))}
          </div>
        </SectionPanel>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <form className={`${panelClass} space-y-3`} onSubmit={submit}>
          <p className="section-label">{t('health_form_title')}</p>
          <Field label={t('animal')} value={form.animal} onChange={(animal) => setForm({ ...form, animal })} />
          <SelectField
            label={t('event_type')}
            value={form.event}
            onChange={(value) => setForm({ ...form, event: value })}
            options={[
              { value: 'Treatment', label: t('treatment') },
              { value: 'Vaccination', label: t('vaccination') },
              { value: 'Checkup', label: t('checkup') },
              { value: 'Injury', label: t('injury') },
            ]}
          />
          <Field label={t('date')} type="date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
          <Field label={t('notes')} value={form.notes} onChange={(notes) => setForm({ ...form, notes })} placeholder={t('notes_placeholder')} />
          <button className="btn-primary" type="submit">{t('save_health_event')}</button>
        </form>
        <SectionPanel title={t('vet_history')}>
          <div className="space-y-3">
            {events.map((event) => <TimelineItem key={event}>{event}</TimelineItem>)}
          </div>
        </SectionPanel>
      </section>
    </div>
  );
}

function FeedView() {
  const t = useLivestockText();
  const [deliveries, setDeliveries] = useState(['2026-05-21 - Dairy meal - 600 kg']);
  const [form, setForm] = useState({ item: 'Dairy meal', quantity: '250', supplier: 'Kigali Feeds' });
  const inventory = [
    ['Dairy meal', 38, 'low'],
    ['Hay bales', 72, 'ok'],
    ['Mineral lick', 44, 'ok'],
    ['Calf starter', 18, 'low'],
  ];

  function submit(event) {
    event.preventDefault();
    setDeliveries((items) => [`2026-05-27 - ${form.item} - ${form.quantity} kg from ${form.supplier}`, ...items]);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('feed_title')} subtitle={t('feed_subtitle')} icon={FeedIcon} />
      <section className="grid lg:grid-cols-2 gap-4">
        <SectionPanel title={t('feed_inventory')}>
          <div className="space-y-4">
            {inventory.map(([name, level, tone]) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1"><span>{name}</span><Badge tone={tone === 'low' ? 'urgent' : 'ok'}>{level}%</Badge></div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className={`h-3 rounded-full ${tone === 'low' ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${level}%` }} /></div>
              </div>
            ))}
          </div>
        </SectionPanel>
        <SectionPanel title={t('daily_consumption')}>
          {['Dairy cows - 42 kg', 'Heifers - 18 kg', 'Goats - 11 kg', 'Calves - 9 kg'].map((item) => (
            <p key={item} className="text-sm text-gray-700 border-b border-gray-100 py-3 last:border-0">{item}</p>
          ))}
        </SectionPanel>
      </section>
      <section className="grid lg:grid-cols-2 gap-4">
        <SectionPanel title={t('feed_schedule')}>
          {['06:00 - Dairy cows: silage and dairy meal', '12:00 - Calves: starter and water check', '17:00 - All groups: hay and minerals'].map((item) => (
            <TimelineItem key={item} meta={item.slice(0, 5)}>{item.slice(8)}</TimelineItem>
          ))}
        </SectionPanel>
        <form className={`${panelClass} space-y-3`} onSubmit={submit}>
          <p className="section-label">{t('record_feed_delivery')}</p>
          <Field label={t('feed_item')} value={form.item} onChange={(item) => setForm({ ...form, item })} />
          <Field label={t('quantity_kg')} type="number" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity })} />
          <Field label={t('supplier')} value={form.supplier} onChange={(supplier) => setForm({ ...form, supplier })} />
          <button className="btn-primary" type="submit">{t('save_delivery')}</button>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-2">
            {deliveries.map((item) => <p key={item} className="text-xs text-gray-500">{item}</p>)}
          </div>
        </form>
      </section>
    </div>
  );
}

function BreedingView() {
  const t = useLivestockText();
  const [records, setRecords] = useState(['Bella x Bull A - served 2026-04-12', 'Aline x Bull B - served 2026-03-28']);
  const [form, setForm] = useState({ cow: 'Bella', bull: 'Bull A', date: '2026-05-27' });

  function submit(event) {
    event.preventDefault();
    setRecords((items) => [`${form.cow} x ${form.bull} - served ${form.date}`, ...items]);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('breeding_title')} subtitle={t('breeding_subtitle')} icon={RecordIcon} />
      <section className="grid lg:grid-cols-3 gap-4">
        <SectionPanel title={t('pairing_records')}>{records.map((item) => <p key={item} className="text-sm py-3 border-b border-gray-100 last:border-0">{item}</p>)}</SectionPanel>
        <SectionPanel title={t('pregnancy_tracking')}>{['Bella - due 2027-01-17', 'Aline - due 2026-12-31'].map((item) => <p key={item} className="text-sm py-3 border-b border-gray-100 last:border-0">{item}</p>)}</SectionPanel>
        <SectionPanel title={t('calving_history')}>{['2026-05-18 - twins - Group B', '2026-04-08 - calf C-041'].map((item) => <p key={item} className="text-sm py-3 border-b border-gray-100 last:border-0">{item}</p>)}</SectionPanel>
      </section>
      <form className={`${panelClass} grid md:grid-cols-4 gap-3 items-end`} onSubmit={submit}>
        <Field label={t('cow')} value={form.cow} onChange={(cow) => setForm({ ...form, cow })} />
        <Field label={t('bull')} value={form.bull} onChange={(bull) => setForm({ ...form, bull })} />
        <Field label={t('breeding_date')} type="date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
        <button className="btn-primary" type="submit">{t('record_breeding')}</button>
      </form>
    </div>
  );
}

function FinancesView() {
  const t = useLivestockText();
  const [transactions, setTransactions] = useState([
    { date: '2026-05-22', category: 'sales', note: 'Milk sales', amount: 420000 },
    { date: '2026-05-19', category: 'feed', note: 'Dairy meal', amount: -180000 },
  ]);
  const [form, setForm] = useState({ category: 'feed', note: '', amount: '50000' });
  const income = transactions.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
  const expense = Math.abs(transactions.filter((item) => item.amount < 0).reduce((sum, item) => sum + item.amount, 0));

  function submit(event) {
    event.preventDefault();
    const signedAmount = form.category === 'sales' ? Number(form.amount) : -Math.abs(Number(form.amount));
    setTransactions((items) => [{ date: '2026-05-27', category: form.category, note: form.note || form.category, amount: signedAmount }, ...items]);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('finances_title')} subtitle={t('finances_subtitle')} icon={MarketIcon} />
      <section className="grid sm:grid-cols-3 gap-3">
        <div className={`${softPanelClass} border-l-4 border-l-emerald-500`}><p className="text-xs text-gray-400">{t('income')}</p><p className="text-xl font-semibold">RWF {income.toLocaleString()}</p></div>
        <div className={`${softPanelClass} border-l-4 border-l-red-500`}><p className="text-xs text-gray-400">{t('expenses')}</p><p className="text-xl font-semibold">RWF {expense.toLocaleString()}</p></div>
        <div className={`${softPanelClass} border-l-4 border-l-sky-500`}><p className="text-xs text-gray-400">{t('net_profit')}</p><p className="text-xl font-semibold">RWF {(income - expense).toLocaleString()}</p></div>
      </section>
      <section className="grid lg:grid-cols-2 gap-4">
        <MiniChart values={profitTrend} label={t('monthly_pl')} color="bg-emerald-500" />
        <form className={`${panelClass} space-y-3`} onSubmit={submit}>
          <p className="section-label">{t('add_transaction')}</p>
          <SelectField label={t('category')} value={form.category} onChange={(category) => setForm({ ...form, category })} options={['feed', 'vet', 'sales', 'equipment']} />
          <Field label={t('note')} value={form.note} onChange={(note) => setForm({ ...form, note })} />
          <Field label={t('amount_rwf')} type="number" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
          <button className="btn-primary" type="submit">{t('add_transaction')}</button>
        </form>
      </section>
      <SectionPanel title={t('transaction_log')}>{transactions.map((item, index) => <p key={`${item.note}-${index}`} className="text-sm py-3 border-b border-gray-100 last:border-0">{item.date} - {item.category} - {item.note} - RWF {item.amount.toLocaleString()}</p>)}</SectionPanel>
    </div>
  );
}

function InventoryView() {
  const t = useLivestockText();
  const [stock, setStock] = useState(['Dewormer - 12 bottles', 'Disinfectant - 20 L', 'Milking liners - 8 sets']);
  const [form, setForm] = useState({ item: 'Dewormer', detail: '2 bottles added' });

  function submit(event) {
    event.preventDefault();
    setStock((items) => [`${form.item} - ${form.detail}`, ...items]);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('inventory_title')} subtitle={t('inventory_subtitle')} icon={RecordIcon} />
      <section className="grid lg:grid-cols-2 gap-4">
        <SectionPanel title={t('supplies_medicines')}>{stock.map((item) => <p key={item} className="text-sm py-3 border-b border-gray-100 last:border-0">{item}</p>)}</SectionPanel>
        <SectionPanel title={t('maintenance_schedule')}>{[['Milking machine', 'overdue'], ['Water pump', 'upcoming'], ['Cooling tank', 'info']].map(([item, tone]) => <div key={item} className="flex justify-between py-3 border-b border-gray-100 last:border-0"><span className="text-sm">{item}</span><Badge tone={tone}>{tone}</Badge></div>)}</SectionPanel>
      </section>
      <form className={`${panelClass} grid md:grid-cols-3 gap-3 items-end`} onSubmit={submit}>
        <Field label={t('stock_equipment')} value={form.item} onChange={(item) => setForm({ ...form, item })} />
        <Field label={t('update_detail')} value={form.detail} onChange={(detail) => setForm({ ...form, detail })} />
        <button className="btn-primary" type="submit">{t('save_update')}</button>
      </form>
    </div>
  );
}

function ProductionView() {
  const t = useLivestockText();
  const [entries, setEntries] = useState(['2026-05-27 - Milk - 64 L', '2026-05-26 - Milk - 61 L']);
  const [form, setForm] = useState({ product: 'Milk', quantity: '64', unit: 'L' });

  function submit(event) {
    event.preventDefault();
    setEntries((items) => [`2026-05-27 - ${form.product} - ${form.quantity} ${form.unit}`, ...items]);
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('production_title')} subtitle={t('production_subtitle')} icon={ProductionIcon} />
      <section className="grid lg:grid-cols-2 gap-4">
        <SectionPanel title={t('yield_log')}>{entries.map((item) => <p key={item} className="text-sm py-3 border-b border-gray-100 last:border-0">{item}</p>)}</SectionPanel>
        <SectionPanel title={t('weight_tracking')}>{['Dairy cows avg: 486 kg', 'Heifers avg: 318 kg', 'Goats avg: 34 kg'].map((item) => <p key={item} className="text-sm py-3 border-b border-gray-100 last:border-0">{item}</p>)}</SectionPanel>
      </section>
      <section className="grid lg:grid-cols-2 gap-4">
        <MiniChart values={targetTrend} label={t('targets_actuals')} color="bg-amber-500" />
        <form className={`${panelClass} space-y-3`} onSubmit={submit}>
          <p className="section-label">{t('production_entry')}</p>
          <Field label={t('product')} value={form.product} onChange={(product) => setForm({ ...form, product })} />
          <Field label={t('quantity')} type="number" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity })} />
          <Field label={t('unit')} value={form.unit} onChange={(unit) => setForm({ ...form, unit })} />
          <button className="btn-primary" type="submit">{t('save_production')}</button>
        </form>
      </section>
    </div>
  );
}

function AlertsView() {
  const t = useLivestockText();
  const [alerts, setAlerts] = useState([
    { id: 1, task: 'Vaccinate Aline', due: 'Overdue by 3 days', priority: 'urgent' },
    { id: 2, task: 'Reorder dairy meal', due: 'Due tomorrow', priority: 'upcoming' },
    { id: 3, task: 'Calving check for Bella', due: 'Due in 7 days', priority: 'upcoming' },
    { id: 4, task: 'Service water pump', due: 'Due in 14 days', priority: 'info' },
  ]);

  function updateAlert(id, action) {
    setAlerts((items) => action === 'dismiss'
      ? items.filter((item) => item.id !== id)
      : items.map((item) => item.id === id ? { ...item, due: 'Snoozed for 3 days', priority: 'info' } : item));
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('alerts_title')} subtitle={t('alerts_subtitle')} icon={RecordIcon} />
      <SectionPanel title={t('task_list')}>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 hover:bg-primary/5 transition-colors">
              <div>
                <div className="flex items-center gap-2"><p className="font-medium text-gray-900">{alert.task}</p><Badge tone={alert.priority}>{alert.priority}</Badge></div>
                <p className="text-sm text-gray-500 mt-1">{alert.due}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="pill text-xs" onClick={() => updateAlert(alert.id, 'snooze')}>{t('snooze')}</button>
                <button type="button" className="pill text-xs" onClick={() => updateAlert(alert.id, 'dismiss')}>{t('dismiss')}</button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && <p className="text-sm text-gray-500">{t('no_active_reminders')}</p>}
        </div>
      </SectionPanel>
    </div>
  );
}

export default function LivestockPage({ type }) {
  const views = useMemo(() => ({
    dashboard: <Dashboard />,
    health: <HealthView />,
    feed: <FeedView />,
    breeding: <BreedingView />,
    finances: <FinancesView />,
    inventory: <InventoryView />,
    production: <ProductionView />,
    alerts: <AlertsView />,
  }), []);

  return views[type] || views.dashboard;
}
