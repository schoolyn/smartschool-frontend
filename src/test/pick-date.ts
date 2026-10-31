import { screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// picks a day in a DatePicker the way a person does: open it, choose the month and year, click the day
export const pickDate = async (user: UserEvent, label: string, iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  await user.click(screen.getByLabelText(label));
  await user.selectOptions(await screen.findByRole("combobox", { name: /month/i }), String(month - 1));
  await user.selectOptions(screen.getByRole("combobox", { name: /year/i }), String(year));
  await user.click(
    screen.getByRole("button", { name: new RegExp(`${MONTHS[month - 1]} ${day}(st|nd|rd|th), ${year}`) })
  );
};
