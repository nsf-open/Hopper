export interface LeftNavItem {
  key: string;
  name: string;
  url: string;
  isExpanded?: boolean;
}

export interface LeftNavSection {
  name: string;
  collapseByDefault?: boolean;
  links: LeftNavItem[];
  isExpanded?: boolean;
}
