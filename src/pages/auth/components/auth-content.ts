import {
  BanknotesIcon,
  BellIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

export const FEATURES = [
  { key: "attendance", icon: ClipboardDocumentCheckIcon },
  { key: "homework", icon: BookOpenIcon },
  { key: "notices", icon: BellIcon },
  { key: "fees", icon: BanknotesIcon },
  { key: "results", icon: ChartBarIcon },
  { key: "mobile", icon: DevicePhoneMobileIcon },
] as const;

export interface Moment {
  time: string;
  title: string;
  who: string;
  from: string;
  action: string;
  effort: string;
  channels: string;
  pushTitle: string;
  pushBody: string;
}

// sample school-day scenarios shown beside the sign-in card; copy is kept to one line so the card never changes height
export const MOMENTS: Moment[] = [
  {
    time: "07:52",
    title: "Attendance",
    who: "Teacher marks Class 7-B",
    from: "TEACHER · CLASS 7-B",
    action: "Marks the whole section present, absent or late in one screen",
    effort: "One screen",
    channels: "Saved → visible to parents immediately",
    pushTitle: "Aarav is present today",
    pushBody: "Marked present in Class 7-B at 7:52 AM.",
  },
  {
    time: "11:15",
    title: "Homework",
    who: "Teacher posts to Grade 6 Science",
    from: "TEACHER · GRADE 6",
    action: "Posts the Chapter 4 worksheet to the class, due Thursday",
    effort: "Posted once",
    channels: "In-app · email · push",
    pushTitle: "New homework: Science",
    pushBody: "Chapter 4 worksheet, due Thursday.",
  },
  {
    time: "13:30",
    title: "Fees",
    who: "Office sends an installment reminder",
    from: "ADMIN · FEES",
    action: "Sends the Term 2 installment reminder to pending accounts",
    effort: "One click",
    channels: "Reminder → receipt PDF on payment",
    pushTitle: "Term 2 installment due",
    pushBody: "Due 15 Oct. Tap to view your fee ledger.",
  },
  {
    time: "15:00",
    title: "Notices",
    who: "Office posts to the whole school",
    from: "ADMIN · NOTICES",
    action: "Posts the Annual Day notice to every class",
    effort: "Posted once",
    channels: "In-app · email · push",
    pushTitle: "Annual Day on 24 Oct",
    pushBody: "Tap to read the full notice from school.",
  },
  {
    time: "17:30",
    title: "Results",
    who: "Report cards go out",
    from: "TEACHER · GRADE 10",
    action: "Publishes the half-yearly report cards for Grade 10",
    effort: "Versioned",
    channels: "Published → parent app",
    pushTitle: "Report card is ready",
    pushBody: "Grade 10 half-yearly results are out.",
  },
];
