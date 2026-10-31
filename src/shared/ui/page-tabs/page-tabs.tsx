import type { ComponentType, ReactNode, SVGProps } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/kit/tabs";

export interface PageTab<K extends string = string> {
  key: K;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  // only the open tab is rendered
  render: () => ReactNode;
}

interface PageTabsProps<K extends string> {
  tabs: PageTab<K>[];
  value: K;
  onChange: (key: K) => void;
  label?: string;
  // shared controls between the tab row and the open tab
  children?: ReactNode;
}

// a page's tab row and its open tab, driven by one array of tabs
const PageTabs = <K extends string>({ tabs, value, onChange, label, children }: PageTabsProps<K>) => {
  const active = tabs.find((tab) => tab.key === value);

  return (
    <Tabs value={value} onValueChange={(key) => onChange(key as K)} className="space-y-6">
      <TabsList aria-label={label}>
        {tabs.map(({ key, label: name, icon: Icon }) => (
          <TabsTrigger key={key} value={key}>
            <Icon />
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
      {active && (
        <TabsContent value={active.key} className="mt-0">
          {active.render()}
        </TabsContent>
      )}
    </Tabs>
  );
};

export default PageTabs;
