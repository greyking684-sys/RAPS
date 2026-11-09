import { ShiftReport } from "../types/oee";
import { DEPT, buildMachineRecord } from "../utils/oeeCalculations";

export const INITIAL_REPORTS: ShiftReport[] = [
    {
      id: "2026-10-30_day",
      date: "2026-10-30",
      shift: "day",
      hrs: 11,
      ld: "\u2013",
      flags: [],
      notes: ["Borun 03: 1h 20m housekeeping at morning takeover"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 177e3, 0, 0, 443.9, 2.5, null, [], "Handed over running well", "24/24", 5.2, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 17280, 51, 0, 406, 23.5, null, ["51m adjusting trimmer belt and housekeeping"], "Handed over running", "12/12", 22.5, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 21120, 20404, 80, 0, 479.5, 23.5, null, ["80m machine adjustments"], "Handed over running", "12/12", 22.5, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 21120, 15872, 96, 0, 404.7, 25.5, null, ["80m housekeeping at takeover", "16m adjusting trimmer belt"], "Handed over running well", "12/12", 22.5, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 39600, 30, 0, 249.48, 6.2, null, ["30m chiller temperature too high"], "Handed over running well", "14/16", 13.5, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 42e3, 20, 0, 264.6, 6.2, null, ["20m nozzle cleaning"], "Handed over running perfectly", "15/16", 13.5, 11)
      ]
    },
    {
      id: "2026-10-30_night",
      date: "2026-10-30",
      shift: "night",
      hrs: 13,
      ld: "\u2013",
      flags: [],
      notes: ["All scheduled lines running well"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 207e3, 0, 0, 517.5, 2.5, null, [], "Handed over running", "24/24", 5.2, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 22656, 26, 0, 532.4, 23.5, null, ["26m left deflasher error & housekeeping"], "Handed over running", "12/12", 22.5, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 23424, 15, 2.6, 553.1, 23.5, null, ["15m bagger malfunction"], "Handed over running", "12/12", 22.5, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 24960, 20608, 60, 2, 527.5, 25.5, null, ["60m trimmer belt replacement & mould moving error"], "Handed over running", "12/12", 22.5, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 42e3, 0, 3.5, 264.6, 6.2, null, [], "Handed over running well", "14/16", 13.2, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 46800, 0, 4.64, 294.8, 6.2, null, [], "Handed over running", "15/16", 13.6, 13)
      ]
    },
    {
      id: "2026-10-31_day",
      date: "2026-10-31",
      shift: "day",
      hrs: 11,
      ld: "\u2013",
      flags: [],
      notes: ["Chiller broken connector repaired across 4 lines"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 18e4, 0, 0, 450, 2.5, null, [], "Handed over running well", "24/24", 5.2, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 14976, 152, 0, 351.94, 23.5, null, ["152m hopper suction, left deflasher lump & chiller broken connector"], "Handed over running", "12/12", 22.5, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 21120, 17280, 108, 0, 406.1, 23.5, null, ["108m cleaning die #4 & chiller broken connector"], "Handed over running", "12/12", 22.5, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 21120, 16e3, 111, 0, 408, 25.5, null, ["111m trimmer adjustment & chiller broken connector"], "Handed over running well", "12/12", 22.5, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 31200, 110, 1.96, 195.4, 6.2, null, ["110m separating mould to clean torpedoes & chiller broken connector"], "Handed over running well", "16/16", 13.2, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 42e3, 8, 4.5, 264.9, 6.2, null, ["8m removing lump from nozzle"], "Handed over running perfectly", "15/16", 13.5, 11)
      ]
    },
    {
      id: "2026-10-31_night",
      date: "2026-10-31",
      shift: "night",
      hrs: 13,
      ld: "\u2013",
      flags: [],
      notes: ["Peak shift attainment (93%): 369,840 good units"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 21e4, 0, 0, 525, 2.5, null, [], "Handed over machine running", "24/24", 5.2, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 19840, 75, 5.1, 471.3, 23.5, null, ["75m adjustment of trimmer and housekeeping"], "Handed over machine running", "12/12", 22.5, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 24064, 0, 10, 565.5, 23.5, null, [], "Handed over machine running", "12/12", 22.5, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 24960, 17536, 144, 6.5, 449.8, 25.5, null, ["144m trimmer adjustment & product line adjustment"], "Handed over machine running", "12/12", 22.5, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 46800, 0, 0, 290.16, 6.2, null, [], "Handed over machine running well", "13/16", 13.2, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 51600, 0, 5.08, 325, 6.2, null, [], "Handed over machine running", "15/16", 13.8, 13)
      ]
    },
    {
      id: "2026-11-01_day",
      date: "2026-11-01",
      shift: "day",
      hrs: 11,
      ld: "S. Mseza / Shingi",
      flags: ["380T: Tested repaired spare mould (sleeve plate water blocked; remounted previous mould)"],
      notes: ["Borun 01: Metal object stuck in die head (5h 54m)", "Chiller Comp 4 alarm across Borun 01\u201303"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 18e4, 0, 0, 450, 2.5, null, [], "Handed over machine running well", "24/24", 5.2, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 8960, 354, 0, 351.94, 23.5, null, ["354m metal object stuck in die head, parison #4/#5 & chiller comp 4 alarm"], "Handed over running", "12/12", 22.5, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 21120, 18944, 55, 0, 445, 23.5, null, ["55m cleaning die #4 & attending chiller comp 4 alarm"], "Handed over machine running", "12/12", 22.5, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 21120, 14592, 125, 0, 357.5, 25.5, null, ["125m removing contaminated material from hopper/mixer & chiller comp 4 alarm"], "Handed over machine running well", "12/12", 22.5, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 39600, 0, 0.88, 246.4, 6.2, null, [], "Handed over machine running well", "13/16", 13.2, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 6e3, 550, 8.3, 45.5, 6.2, null, ["550m mould change to test repaired mould (sleeve plate water blocked; remounted old mould)"], "Handed over machine running well", "15/16", 13.5, 11)
      ]
    },
    {
      id: "2026-11-01_night",
      date: "2026-11-01",
      shift: "night",
      hrs: 13,
      ld: "Josh / Muchauya",
      flags: ["Borun 03: Hydraulic bush housing leaking oil (10h 42m)"],
      notes: ["Compression 1A delivered 210,000 closures; 380T rebounded to 46,800 closures"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 21e4, 0, 0, 540, 2.5, null, [], "Handed over machine running well", "24/24", 5.2, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 20224, 80, 0, 475.3, 23.5, null, ["80m bottles falling on trimmer & housekeeping"], "Handed over running", "12/12", 22.5, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 23424, 20, 0, 550.5, 23.5, null, ["20m knife sticking"], "Handed over machine running", "12/12", 22.5, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 24960, 4096, 642, 1.15, 105.6, 25.5, null, ["642m hydraulic bush housing leaking oil"], "Handed over machine running well", "12/12", 22.5, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 43200, 0, 0, 267.8, 6.2, null, [], "Handed over machine running well", "13/16", 13.2, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 46800, 0, 4.64, 294.8, 6.2, null, [], "Handed over machine running well", "15/16", 13.5, 13)
      ]
    },
    {
      id: "2026-11-02_day",
      date: "2026-11-02",
      shift: "day",
      hrs: 11,
      ld: "S. Mseza / Shingi",
      flags: ["Monitor Borun chiller", "Monitor Compression 01A oil pump variable alarm"],
      notes: ["Borun 01 stopped 1h 47m to allow 320T 01 to run due to chiller overload"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 147e3, 86, 18.66, 386.16, 2.5, 0.94, ["60m colour change", "26m oil variable pump"], "Handed over running well", "24/24", 5.2, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 13696, 182, 7.7, 329.56, 23.3, 0.96, ["75m chiller problem", "107m stopped to allow 320T 01 to run"], "Handed over running", "12/12", 23, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 21120, 17536, 103, 6.2, 412.1, 23.28, 0.96, ["29m removing lump under machine", "83m chiller overloading"], "Handed over running", "12/12", 23, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 21120, 14592, 142, 4.2, 376.1, 25.4, 0.93, ["60m fitter attending oil leak & HK", "72m chiller overloading"], "Handed over running well", "12/12", 23, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 25200, 187, 0.96, 157.2, 6.2, 0.98, ["187m chiller compressor alarm"], "Handed over running", "12/16", 13.3, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 38400, 0, 0.8, 242.7, 6.3, 0.98, [], "Handed over running well", "13/16", 13.7, 11)
      ]
    },
    {
      id: "2026-11-02_night",
      date: "2026-11-02",
      shift: "night",
      hrs: 13,
      ld: "R. Mudzimba",
      flags: ["380T: Clean chiller water filter immediately (no pipe wrench on night shift)"],
      notes: ["380T: 2 pallets selected for sprues sorting (52,800 closures)"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 189e3, 50, 2.6, 479, 2.5, null, ["50m chiller water empty"], "Machine running well", "24/24", 5.2, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 20480, 35, 0, 481.3, 23.5, null, ["35m housekeeping"], "Machine running well", "12/12", 22.5, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 23040, 0, 0, 541.44, 23.5, null, [], "Machine running well", "12/12", 23.5, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 24960, 22272, 0, 0, 567.9, 25.5, null, [], "Machine running well", "12/12", 24, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 40800, 0, 0, 255.4, 6.26, null, [], "Machine running well", "12/16", 14, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 52800, 0, 2, 334.6, 6.28, null, [], "2 pallets selected for sprues; clean chiller filter", "14/16", 13.5, 13)
      ]
    },
    {
      id: "2026-11-03_day",
      date: "2026-11-03",
      shift: "day",
      hrs: 11,
      ld: "S. Mseza / Shingi",
      flags: [],
      notes: ["Borun 01: Parison 4 broken capscrew fished out (4h 20m)", "380T: Separated mould 3x for cavity blanking (2h 58m)"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 174e3, 15, 1.96, 433.04, 2.45, 0.92, ["15m force synchronising the machine"], "Handed over running well", "24/24", 5.2, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 12288, 260, 1.7, 290.47, 23.3, 0.94, ["260m parison 4 not responding to adjustments & broken capscrew fished out"], "Handed over running", "12/12", 23, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 21120, 20992, 0, 2.16, 493.3, 23.2, 0.98, [], "Machine running well", "12/12", 23, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 21120, 17664, 80, 4.36, 453, 25.4, 0.96, ["10m machine inspection", "40m left/right mould end error", "20m trimmer belt replacement"], "Handed over running well", "12/12", 23, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 32400, 0, 3.22, 204.1, 6.2, 0.98, [], "Adjusting sprues while running", "12/16", 14.5, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 21600, 178, 1.8, 140.8, 6.3, 0.98, ["178m separating mould thrice due to cavity blanking"], "Handed over running well", "13/16", 13.8, 11)
      ]
    },
    {
      id: "2026-11-03_night",
      date: "2026-11-03",
      shift: "night",
      hrs: 13,
      ld: "R. Mudzimba",
      flags: [],
      notes: ["320T 01: Mould stuck closed in automatic mode (1h 25m)"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 207e3, 0, 0, 517.5, 2.5, null, [], "Machine running well", "24/24", 5.2, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 22656, 30, 0, 532.7, 23.5, null, ["30m housekeeping"], "Machine running well", "12/12", 22.5, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 23926, 0, 0, 562.3, 23.5, null, [], "Machine running well", "12/12", 23.5, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 24960, 21632, 50, 0, 551.6, 25.5, null, ["18m mould close error alarm", "32m housekeeping"], "Machine running well", "12/12", 24, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 34800, 85, 0, 219.24, 6.26, null, ["85m mould stuck closed in automatic mode"], "Running", "12/16", 14.5, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 50400, 0, 0, 312.4, 6.27, null, [], "Running well", "14/16", 13.5, 13)
      ]
    },
    {
      id: "2026-11-04_day",
      date: "2026-11-04",
      shift: "day",
      hrs: 11,
      ld: "Josh / Muchauya",
      flags: ["Borun 03 urgently needs trimmer belt spares"],
      notes: ["Management held alignment meeting with shift leaders on floor control & quality targets"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 174e3, 0, 0, 435.04, 2.45, 0.92, [], "Handed over running well", "24/24", 5.2, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 13824, 202, 46.2, 368.3, 23.3, 0.94, ["202m attending parison 6 weak side"], "Handed over running", "12/12", 23, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 21120, 19584, 30, 0, 460.2, 23.2, 0.95, ["30m left and right station error"], "Machine running well", "12/12", 23, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 21120, 18438, 25, 2.2, 472.4, 25.4, 0.96, ["25m machine inspection & removing lump from heater band"], "Handed over running well", "12/12", 23, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 37200, 0, 3.22, 234.3, 6.2, 0.98, [], "Handed over running", "12/16", 14.5, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 3e4, 160, 1.8, 189, 6.3, 0.98, ["160m nozzle lump & barrel heaters fixed by electrician"], "Handed over running well", "13/16", 13.8, 11)
      ]
    },
    {
      id: "2026-11-04_night",
      date: "2026-11-04",
      shift: "night",
      hrs: 13,
      ld: "R. Mudzimba",
      flags: ["Borun 03 urgently needs trimmer belt spares"],
      notes: ["358,928 good units across 6 lines (90% attainment)"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 21e4, 0, 0, 525, 2.45, 0.94, [], "Handed over running well", "24/24", 5.3, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 22016, 75, 0, 517.4, 23.4, 0.94, ["75m realigning right station mould"], "Handed over running", "12/12", 23, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 23040, 0, 0, 541.4, 23.2, 0.9, [], "Machine running well", "12/12", 23, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 24960, 22272, 20, 2.2, 567.9, 25.4, 0.9, ["20m adjusting trimmer belt"], "Handed over running well", "12/12", 23, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 38400, 0, 0, 241.92, 6.21, 0.9, [], "Handed over running", "12/16", 14.5, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 43200, 0, 0.8, 273.03, 6.27, 0.92, [], "Handed over running well", "12/16", 13.5, 13)
      ]
    },
    {
      id: "2026-11-05_day",
      date: "2026-11-05",
      shift: "day",
      hrs: 11,
      ld: "Josh / Muchauya",
      flags: ["Handed over all machines running except Laser Printing is not running"],
      notes: ["380T separated mould to clean torpedoes (now running 14/16 cavities)", "Power surge affected all Borun blow moulders"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 174e3, 0, 0, 435, 2.45, 0.9, [], "Handed over machine running well", "24/24", 5.2, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 16512, 111, 3.2, 388.1, 23.3, 0.92, ["111m cylinder shaft capscrew broken, power surge & left robot pressure pipe burst"], "Handed over machine running", "12/12", 23, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 21120, 17536, 105, 0, 412.1, 23.2, 0.95, ["105m off-center/weak seam line, broken knife cable & power surge"], "Machine running well", "12/12", 23, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 21120, 18688, 20, 3.2, 479.7, 25.4, 0.91, ["20m power surge"], "Handed over machine running well", "12/12", 23, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 33600, 0, 0, 211.6, 6.2, 0.94, [], "Handed over machine running", "12/16", 14.5, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 36e3, 40, 1.34, 226.8, 6.3, 0.92, ["40m removing lump from nozzle & separating mould to clean torpedoes (14/16)"], "Handed over machine running well", "14/16", 13.8, 11)
      ]
    },
    {
      id: "2026-11-05_night",
      date: "2026-11-05",
      shift: "night",
      hrs: 13,
      ld: "R. Mudzimba",
      flags: ["Borun 01 & Borun 02 parked for 4 hours each when packaging bailers got used up"],
      notes: ["320T 01 lost 4h 40m separating mould thrice to clean torpedoes & inconsistent shots"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 207e3, 0, 0, 518.1, 2.45, 0.94, [], "Handed over machine running well", "24/24", 5.3, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 15488, 240, 0, 363.9, 23.4, 0.94, ["240m packaging bailers got used up (parked machine)"], "Parked when bailers ran out", "12/12", 23, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 15104, 240, 0, 357, 23.2, 0.9, ["240m packaging bailers got used up (parked machine)"], "Parked when bailers ran out", "12/12", 23, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 24960, 21888, 20, 2.2, 558.1, 25.4, 0.9, ["20m adjusting trimmer belt"], "Handed over machine running well", "12/12", 23, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 21600, 280, 0, 136.1, 6.21, 0.9, ["160m separating mould to clean torpedoes thrice", "120m inconsistent shots"], "Handed over machine running", "12/16", 14.5, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 45600, 87, 3, 293.3, 6.27, 0.92, ["87m machine failing to plasticize"], "Handed over machine running well", "14/16", 13.5, 13)
      ]
    },
    {
      id: "2026-11-06_day",
      date: "2026-11-06",
      shift: "day",
      hrs: 11,
      ld: "Josh / Muchauya",
      flags: [
        "Cap 01A and 01B to be started after chiller pipe installation done",
        "On 320T 01 Mr. Satande replaced torpedoes \u2014 as of 7pm producing 16/16 cavities"
      ],
      notes: ["Laser Printer: Agreed with Delta team to supply 200,000 by Monday (printing 2,750\u20133,000/hr; 18,000 printed today)"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 153e3, 106, 3.4, 384.1, 2.5, 0.94, ["106m low level alarm overheating cavities & stopped for Cap 01B chiller pipe installation"], "Handed over not running", "24/24", 5.2, 11),
        buildMachineRecord("Compression 1B", DEPT.cc, "Not scheduled", 182761, 0, 0, 0, 0, 2.5, null, [], "Chiller pipe installation in progress", "", null, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 15872, 145, 3.2, 372.9, 23.3, 0.95, ["145m machine starts late due to packaging unavailability & right mould move up error"], "Handed over machine running", "12/12", 23, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 21120, 12672, 240, 3.19, 297.8, 23.2, 0.9, ["240m machine starts late due to packaging unavailability & left mould open failure"], "Machine running well", "12/12", 23, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 21120, 18126, 40, 3.6, 455.9, 25.4, 0.92, ["40m repairing torn heater cable & left mould movement error"], "Handed over machine running well", "12/12", 23, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 24e3, 180, 5, 149, 6.2, 0.92, ["180m nozzle blockage & replacement of torpedoes by Mr. Satande"], "Producing 16 cavities at 7pm", "16/16", 14.5, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 25200, 70, 1, 156.2, 6.3, 0.92, ["70m separate mould to clean torpedoes 3x (running 10/16)"], "Handed over machine running well", "10/16", 13.8, 11)
      ]
    },
    {
      id: "2026-11-06_night",
      date: "2026-11-06",
      shift: "night",
      hrs: 13,
      ld: "S. Mseza / Shingi",
      flags: [
        "We need better lighting \u2014 cannot see rejects on night shift",
        "380T needs attention to improve output (running 10/16 cavities)"
      ],
      notes: ["Compression 1B commissioned (+9,000 closures after 12h 05m startup prep)"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 171e3, 141, 4, 431.85, 2.45, 0.94, ["141m chiller pipe connections (sharing Cap 2 oil chiller with 1B)"], "Handed over machine running well", "24/24", 5.3, 13),
        buildMachineRecord("Compression 1B", DEPT.cc, "Running", 182761, 9e3, 725, 36, 58.5, 2.5, null, ["145m chiller pipe connections", "145m tightening loose cavities", "145m installing new scraper", "145m replacing broken nipple", "145m fixing cavity 23 water jacket"], "Handed over machine running", "24/24", 5.2, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 19584, 114, 23, 460.22, 23.4, 0.84, ["114m adjusting mould weak side on all cavities, right mould error & HK"], "Handed over machine running well", "12/12", 23, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 20992, 121, 0.7, 487, 23.2, 0.9, ["121m broken knife cable, left mould move error & trimmer holding bottles"], "Handed over machine running well", "12/12", 23, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 24960, 22912, 10, 2.2, 584.26, 25.4, 0.88, ["10m attending left station error"], "Handed over machine running well", "12/12", 23, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 48e3, 0, 0, 302.4, 6.3, 0.92, [], "Took over after torpedo replacement; adjusted while running", "15/16", 14.5, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 34800, 88, 3, 227.9, 6.27, 0.88, ["88m found running 10/16 cavities, tried to improve output"], "Machine needs attention", "10/16", 13.5, 13)
      ]
    },
    {
      id: "2026-11-07_day",
      date: "2026-11-07",
      shift: "day",
      hrs: 11,
      ld: "Josh / Muchauya",
      flags: ["Monitor main line cable whilst running and starting up Cap 01A"],
      notes: ["Power cut & main electrical cable overload forced shutdown of Comp 1A (7h) and Borun 03 (9h 30m)"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 63e3, 420, 0, 156.8, 2.5, 0.84, ["420m power cut & instructed to shut down due to cable overload and overheating"], "Handed over not running", "24/24", 5.2, 11),
        buildMachineRecord("Compression 1B", DEPT.cc, "Running", 182761, 12e4, 150, 27.24, 320.74, 2.5, 0.8, ["150m power cut, heat up & punching rod #10 failing to demould (cleaned & lubricated)"], "Handed over machine running", "24/24", 5.2, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 17920, 90, 3.2, 421.1, 23.3, 0.88, ["90m power cut & heat up after power restored"], "Handed over machine running", "12/12", 23, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 21120, 17920, 84, 4.14, 421.1, 23.2, 0.8, ["84m power cut, heat up & startup after power restored"], "Handed over machine running", "12/12", 23, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Running", 21120, 3968, 570, 3.6, 99.8, 25.4, 0.82, ["570m stuck lump, power cut & instructed to shut down to avoid main line cable overload"], "Handed over not running", "12/12", 23, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 32400, 60, 0, 201.4, 6.2, 0.8, ["60m power cut & heat up after power restored"], "Handed over not running", "16/16", 14.5, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 22800, 115, 17, 141.1, 6.3, 0.78, ["115m power cut, heat up & mould separated to clean torpedoes"], "Handed over machine running well", "11/16", 13.8, 11)
      ]
    },
    {
      id: "2026-11-07_night",
      date: "2026-11-07",
      shift: "night",
      hrs: 13,
      ld: "S. Mseza / Shingi",
      flags: [
        "Borun 03: Instructed to stop the machine (main cable load)",
        "Cooling tower blow fan failure needs urgent attention",
        "We need better lighting \u2014 cannot see rejects"
      ],
      notes: [
        "380T needs attention to improve output",
        "Cooling tower blow fan needs urgent attention"
      ],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 18e4, 90, 2.5, 452.5, 2.45, 0.92, ["90m found machine not running due to electrical cable overload"], "Handed over machine running well", "24/24", 5.3, 13),
        buildMachineRecord("Compression 1B", DEPT.cc, "Running", 182761, 177e3, 75, 14.7, 457.2, 2.5, 0.9, ["75m machine system pressure low, attending the machine"], "Handed over machine running", "24/24", 5.2, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 23296, 98, 2.1, 547.45, 23.4, 0.92, ["98m adjusting die #6 & tails stuck under mould"], "Handed over machine running well", "12/12", 23, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 3712, 542, 0, 87.2, 23.2, 0.98, ["271m cleaning die lines", "271m stopped @20:08 to run Cap 1A"], "Handed over machine not running", "12/12", 23, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Idle", 24960, 0, 0, 2.2, 0, 25.4, 0.96, [], "Instructed to stop the machine", "12/12", 23, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 28800, 235, 10, 191.4, 6.3, 0.9, ["115m material change Dow to Wanhua (difficult to stabilize)", "120m cleaning blocked nozzle & transducer error"], "Handed over machine running", "15/16", 14.5, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 31200, 108, 7, 204.6, 6.27, 0.8, ["108m machine adjustments (needs attention)"], "Handed over machine running well", "11/16", 13.5, 13)
      ]
    },
    {
      id: "2026-11-08_day",
      date: "2026-11-08",
      shift: "day",
      hrs: 11,
      ld: "R. Mudzimba",
      flags: [
        "Cap 1B: Not running \u2014 replacement of broken water needle for cavity #8 in progress",
        "Borun 02 & Borun 03: Instructed to stop because of electrical cable overheating",
        "320T 02: Not running (collapsed bearing)"
      ],
      notes: ["Laser Printing running 28mm red closures Delta promotion (36,000 printed)"],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 182761, 177e3, 0, 0, 442.5, 2.45, 0.94, [], "Handed over machine running well", "24/24", 5.3, 11),
        buildMachineRecord("Compression 1B", DEPT.cc, "Running", 182761, 132e3, 170, 0, 330, 2.5, null, ["170m cavity #8 moved off cylinder saddle breakdown / broken water needle"], "Handed over machine not running", "24/24", 5.3, 11),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 21120, 20224, 30, 0, 475.3, 23.4, 0.94, ["30m housekeeping"], "Handed over the machine running", "12/12", 23, 11),
        buildMachineRecord("Borun 02", DEPT.bm, "Idle", 24960, 0, 660, 0, 0, 23.2, 0.9, ["660m machine did not run (electrical cable overheating)"], "Machine did not run", "12/12", 23, 11),
        buildMachineRecord("Borun 03", DEPT.bm, "Idle", 24960, 0, 0, 0, 0, 25.4, 0.9, [], "Machine did not run (electrical cable overheating)", "12/12", 23, 11),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 45903, 39600, 40, 0, 249.4, 6.21, 0.9, ["40m separating mould to clean torpedoes"], "Handed over machine running", "15/16", 14.8, 11),
        buildMachineRecord("380T", DEPT.inj, "Running", 45903, 32400, 50, 3, 204.2, 6.27, 0.92, ["50m machine failing to inject"], "Handed over machine running well", "13/16", 14.5, 11)
      ]
    },
    {
      id: "2026-11-08_night",
      date: "2026-11-08",
      shift: "night",
      hrs: 13,
      ld: "S. Mseza / Shingi",
      flags: [
        "Borun 03: instructed to stop the machine",
        "Cooling tower blow fan failure needs urgent attention",
        "Better lighting needed - cannot see rejects on night shift"
      ],
      notes: [
        "380T needs attention to improve output",
        "Cooling tower blow fan needs urgent attention",
        "Lights at injection machines"
      ],
      ms: [
        buildMachineRecord("Compression 1A", DEPT.cc, "Running", 215991, 21e4, 0, 1.9, 526.9, 2.5, 0.92, [], "Handed over machine running well", "24/24", 5.3, 13),
        buildMachineRecord("Compression 1B", DEPT.cc, "Running", 215991, 165e3, 120, 11.5, 424.1, 2.5, 0.86, ["120m water needle replacement & machine system pressure low"], "Handed over machine running", "24/24", 5.2, 13),
        buildMachineRecord("Borun 01", DEPT.bm, "Running", 24960, 19328, 133, 1.2, 454.2, 23.5, null, ["45m trimmer belt change", "44m weak base on cavity #6", "44m right mould error"], "Handed over not running", "12/12", 23, 13),
        buildMachineRecord("Borun 02", DEPT.bm, "Running", 24960, 3712, 542, 0, 87.2, 23.5, 0.98, ["271m cleaning die lines", "271m stopped @20:08 to run Cap 1A"], "Handed over not running", "12/12", 23, 13),
        buildMachineRecord("Borun 03", DEPT.bm, "Idle", 24960, 0, 0, 2.2, 0, 25.5, 0.96, [], "Instructed to stop the machine", "12/12", 23, 13),
        buildMachineRecord("320T 01", DEPT.inj, "Running", 54249, 50400, 0, 0, 317.5, 6.3, 0.9, [], "Handed over machine running", "15/16", 14.5, 13),
        buildMachineRecord("380T", DEPT.inj, "Running", 54249, 38400, 66, 0.5, 242.4, 6.2, 0.8, ["66m unblanking cavities #8 & #16"], "Handed over machine running well", "11/16", 13.5, 13)
      ]
    }
  ];
