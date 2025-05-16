import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns";

type Mission = {
  id: number;
  created_at: string;
  start_date: string;
  end_date: string;
  driver_id: number;
  vehicle_id: number;
  status: string;
  details: string;
  client?: string;
  client_email?: string;
  client_phone?: string;
};

const MissionsAPI = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date("2023-01-01"));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date("2023-01-01"),
    to: new Date(),
  })
  const [driverId, setDriverId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const { toast } = useToast()

  useEffect(() => {
    fetchMissions();
  }, [startDate, endDate, driverId, status]);

  const fetchMissions = async () => {
    let url = `/rest/v1/missions?select=*`;

    if (driverId) {
      url += `&driver_id=eq.${driverId}`;
    }

    if (status) {
      url += `&status=eq.${status}`;
    }

    if (startDate && endDate) {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      // url += `&start_date=gte.${formattedStartDate}&end_date=lte.${formattedEndDate}`;
      url += `&start_date=gte.${formattedStartDate}&end_date=lte.${formattedEndDate}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMissions(data);
    } catch (error) {
      console.error("Could not fetch missions", error);
      toast({
        title: "Erreur!",
        description: "Could not fetch missions",
      })
    }
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from) {
      setStartDate(newDate.from);
    }
    if (newDate?.to) {
      setEndDate(newDate.to);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Missions Data</h1>

      {/* Filters */}
      <div className="mb-4 flex space-x-2">
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  `${format(date.from, "LLL dd, yyyy")} - ${format(
                    date.to,
                    "LLL dd, yyyy"
                  )}`
                ) : (
                  format(date.from, "LLL dd, yyyy")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Driver ID Filter */}
        <Input
          type="number"
          placeholder="Driver ID"
          className="w-24"
          onChange={(e) => setDriverId(Number(e.target.value) || null)}
        />

        {/* Status Filter */}
        <Select onValueChange={(value) => setStatus(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Fetch Missions Button */}
        <Button onClick={fetchMissions}>Fetch Missions</Button>
      </div>

      {/* Missions Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>A list of your missions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Driver ID</TableHead>
              <TableHead>Vehicle ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Client Email</TableHead>
              <TableHead>Client Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {missions.map((mission) => (
              <TableRow key={mission.id}>
                <TableCell className="font-medium">{mission.id}</TableCell>
                <TableCell>{mission.created_at}</TableCell>
                <TableCell>{mission.start_date}</TableCell>
                <TableCell>{mission.end_date}</TableCell>
                <TableCell>{mission.driver_id}</TableCell>
                <TableCell>{mission.vehicle_id}</TableCell>
                <TableCell>{mission.status}</TableCell>
                <TableCell>{mission.details}</TableCell>
                <TableCell>{mission.client}</TableCell>
                <TableCell>{mission.client_email}</TableCell>
                <TableCell>{mission.client_phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Example API Usage Instructions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">API Usage Example</h2>
        <p className="mb-2">
          You can directly query the Supabase API to fetch missions with
          specific filters. Here are some example queries:
        </p>
        <ul className="list-disc pl-5">
          <li>
            Fetch all missions:
            <code>GET /rest/v1/missions?select=*</code>
          </li>
          <li>
            Fetch missions for a specific driver:
            <code>GET /rest/v1/missions?select=*&driver_id=eq.123</code>
          </li>
          <li>
            Fetch missions with a specific status:
            <code>GET /rest/v1/missions?select=*&status=eq.pending</code>
          </li>
          <li>
            Fetch missions within a date range:
            <code>GET /rest/v1/missions?select=*&start_date=gte.2023-01-01&end_date=lte.2023-01-31</code>
          </li>
          <li>
            Fetch missions for a specific driver with missions starting after a certain date:
            <code>GET /rest/v1/missions?select=*&driver_id=eq.123&start_date=gte.2023-01-01</code>
          </li>
          <li>
            Fetch missions with a specific client email:
            <code>GET /rest/v1/missions?select=*&client_email=eq.client@example.com</code>
          </li>
        </ul>
        <p className="mt-2">
          Remember to include the <code>apikey</code> and{" "}
          <code>Authorization</code> headers with your Supabase API key.
        </p>
      </div>
    </div>
  );
};

export default MissionsAPI;
