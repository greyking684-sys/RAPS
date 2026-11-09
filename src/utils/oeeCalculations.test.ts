import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEPT,
  buildMachineRecord,
  parseDurationMins,
  groupDowntimeCause,
  normalizeLeader,
  aggregateMachines,
} from './oeeCalculations';
import { parseWhatsAppShiftReport, SAMPLE_PASTE_TEXT } from './reportParser';

test('buildMachineRecord calculates Availability, Performance, Quality and OEE correctly', () => {
  // Test 13-hour shift (780 mins), 0 min downtime, target 100,000, good 90,000, 2.5g, mat 225kg
  const m = buildMachineRecord(
    'Compression 1A',
    DEPT.cc,
    'Running',
    100000,
    90000,
    0, // dt = 0
    1.5,
    225, // mat
    2.5, // wt (g)
    0.95,
    [],
    'Running fine',
    '24/24',
    5.2,
    13
  );

  assert.equal(m.av, 1.0); // 780 / 780 = 1.0
  assert.equal(m.att, 0.9); // 90,000 / 100,000
  assert.equal(Math.round(m.perf * 1000) / 1000, 0.9); // 90000 / (100000 * 1.0)
  assert.equal(m.q, 1.0); // (90,000 * 2.5 / 1000) / 225 = 225 / 225 = 1.0
  assert.equal(Math.round((m.oee || 0) * 1000) / 1000, 0.9); // 1.0 * 0.9 * 1.0 = 0.9
  assert.equal(m.unl, false);
});

test('buildMachineRecord handles downtime availability impact and idle machines', () => {
  // 11-hour shift (660 mins), 132 mins downtime -> 528 / 660 = 0.8 Availability
  const m1 = buildMachineRecord(
    'Borun 01',
    DEPT.bm,
    'Running',
    20000,
    16000,
    132,
    2.0,
    400,
    23.5,
    0.9,
    ['132m belt adjustment'],
    'Running',
    '',
    null,
    11
  );
  assert.equal(m1.av, 0.8);

  // Idle machine should have OEE = 0
  const mIdle = buildMachineRecord(
    'Borun 03',
    DEPT.bm,
    'Idle',
    20000,
    0,
    0,
    0,
    0,
    23.5,
    null,
    [],
    'Parked',
    '',
    null,
    11
  );
  assert.equal(mIdle.oee, 0);
});

test('parseDurationMins converts human durations to integer minutes', () => {
  assert.equal(parseDurationMins('15 mins'), 15);
  assert.equal(parseDurationMins('1h 20m'), 80);
  assert.equal(parseDurationMins('2 hours'), 120);
  assert.equal(parseDurationMins('45m'), 45);
  assert.equal(parseDurationMins(''), 0);
  assert.equal(parseDurationMins(null), 0);
});

test('groupDowntimeCause classifies industrial cause strings into standardized categories', () => {
  assert.equal(
    groupDowntimeCause('vfd drive trip on main pump'),
    'Pump VFD / system pressure alarm'
  );
  assert.equal(
    groupDowntimeCause('mains power surge caused cable overload'),
    'Power cut / surge / cable overload'
  );
  assert.equal(
    groupDowntimeCause('chiller water temperature high needle blocked'),
    'Chiller / water cooling system'
  );
  assert.equal(groupDowntimeCause('nil'), null);
});

test('normalizeLeader standardizes shift leader names', () => {
  assert.equal(normalizeLeader('Josh / Muchauya'), 'Josh / Muchauya');
  assert.equal(normalizeLeader('muchauya'), 'Josh / Muchauya');
  assert.equal(normalizeLeader('R. Mudzimba'), 'R. Mudzimba');
  assert.equal(normalizeLeader('S. Mseza / Shingi'), 'S. Mseza / Shingi');
  assert.equal(normalizeLeader('–'), '–');
});

test('parseWhatsAppShiftReport accurately parses full handover text', () => {
  const report = parseWhatsAppShiftReport(SAMPLE_PASTE_TEXT);
  assert.equal(report.shift, 'day');
  assert.equal(report.hrs, 11);
  assert.equal(report.ld, 'Josh / Muchauya');
  assert.equal(report.ms.length >= 5, true);

  const comp1a = report.ms.find((m) => m.n === 'Compression 1A');
  assert.ok(comp1a);
  assert.equal(comp1a?.good, 178500);
  assert.equal(comp1a?.dt, 15);

  const comp1b = report.ms.find((m) => m.n === 'Compression 1B');
  assert.ok(comp1b);
  assert.equal(comp1b?.good, 162000);
  assert.equal(comp1b?.dt, 55);

  assert.equal(report.flags.length >= 2, true);
  assert.equal(report.notes.length >= 2, true);
});

test('aggregateMachines sums targets, goods and averages OEE correctly', () => {
  const report = parseWhatsAppShiftReport(SAMPLE_PASTE_TEXT);
  const agg = aggregateMachines(report.ms);
  assert.equal(agg.T > 0, true);
  assert.equal(agg.G > 0, true);
  assert.equal(agg.att !== null, true);
  assert.equal(agg.dt > 0, true);
});
