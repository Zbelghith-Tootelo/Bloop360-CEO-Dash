import { useState, useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { RisquesPsychosociauxChart } from "./components/RisquesPsychosociauxChart";
import { RadialScoreChart } from "./components/RadialScoreChart";
import { TeamEvolutionChart } from "./components/TeamEvolutionChart";
import { NormalisationChart } from "./components/NormalisationChart";

// ── Avatar image imports (figma:asset scheme) ──────────────────────────────
import imgJohnDoe from "figma:asset/da21dea4016a1e96c35afbdf13698be1d0707b04.png";
import imgElodie from "figma:asset/ba8a9007d6287dc1180e2bf9cebd6af7a6a6d51b.png";
import imgCamille from "figma:asset/2a4725d71881ca218273d0c90d780f5baa3c47d7.png";
import imgElodie2 from "figma:asset/ae494eae6e9632e08a4bc414565265b7fd8eb58f.png";
import imgJulien from "figma:asset/1481ae2d3e8333ff517646e4cefd8d26cfc43922.png";
import imgCamille2 from "figma:asset/8c51d4525445c81d68eff6e426f3c29872b7fc6d.png";
import imgLucas from "figma:asset/c7a73b3ed8edb2a50f46e45f816683ed992d3ace.png";
import imgSophie from "figma:asset/d25ee9fda285029c794d20381a9025b7a124040e.png";
import imgLuc from "figma:asset/3fb84517c4c4b01f64ac2599eac473be4a8eb3e0.png";
import imgJulienM from "figma:asset/0d9d0f8c1b827a2f5e19132899970e85082daa39.png";
import imgNicolas from "figma:asset/0c4a30be67a459ab3363c8b9a59ac3f6b1e52d10.png";
import imgSophieL from "figma:asset/dad736110839321ad1ccbc84ed074f9cc6ec0113.png";

// ── Data ───────────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const COLOR_PALETTE = [
  "#00B7AE", "#1E81FF", "#FF6B6B", "#F59E0B",
  "#8B5CF6", "#10B981", "#F97316", "#EC4899",
  "#04604E", "#6366F1",
];

const avg = (nums: number[]) => nums.reduce((s, n) => s + n, 0) / (nums.length || 1);

interface Employee {
  id: string;
  name: string;
  avatar: string;
  isTeamLead: boolean;
  teamId: string;
  metrics: { bienveillance: number; apport: number; positivite: number; accomplissement: number; bienEtre: number; plaisir: number; enps: string };
  drapeaux: { green: number; orange: number; red: number };
  monthlyData: number[];
  members?: Employee[];
}

const TEAMS: Employee[] = [
  {
    id: "elodie-moreau",
    name: "Élodie Moreau",
    avatar: imgElodie,
    isTeamLead: true,
    teamId: "team-elodie",
    metrics: { bienveillance: 9.23, apport: 8.73, positivite: 8.19, accomplissement: 6.23, bienEtre: 8.95, plaisir: 7.73, enps: "N/A" },
    drapeaux: { green: 8, orange: 10, red: 5 },
    monthlyData: [8.9, 9.1, 9.0, 8.8, 9.2, 9.3, 9.1, 8.9, 9.0, 9.2, 9.3, 9.1],
    members: [
      {
        id: "elodie-sub",
        name: "Élodie More...",
        avatar: imgElodie2,
        isTeamLead: false,
        teamId: "team-elodie",
        metrics: { bienveillance: 9.20, apport: 7.85, positivite: 8.60, accomplissement: 6.40, bienEtre: 9.10, plaisir: 7.30, enps: "N/A" },
        drapeaux: { green: 11, orange: 8, red: 3 },
        monthlyData: [8.5, 8.7, 8.6, 8.4, 8.8, 8.9, 8.7, 8.5, 8.6, 8.8, 8.9, 8.7],
      },
      {
        id: "julien-dupont",
        name: "Julien Dupo...",
        avatar: imgJulien,
        isTeamLead: false,
        teamId: "team-elodie",
        metrics: { bienveillance: 7.60, apport: 9.20, positivite: 6.90, accomplissement: 8.50, bienEtre: 7.10, plaisir: 9.40, enps: "N/A" },
        drapeaux: { green: 9, orange: 11, red: 4 },
        monthlyData: [7.8, 8.1, 7.9, 8.3, 8.0, 7.7, 8.2, 8.4, 7.9, 8.1, 8.3, 8.0],
      },
      {
        id: "camille-sub",
        name: "Camille Lefè...",
        avatar: imgCamille2,
        isTeamLead: false,
        teamId: "team-elodie",
        metrics: { bienveillance: 8.80, apport: 6.70, positivite: 9.50, accomplissement: 7.90, bienEtre: 6.20, plaisir: 8.70, enps: "N/A" },
        drapeaux: { green: 13, orange: 7, red: 2 },
        monthlyData: [8.2, 8.5, 8.8, 8.6, 8.3, 8.7, 8.4, 8.1, 8.6, 8.9, 8.5, 8.4],
      },
      {
        id: "lucas",
        name: "Lucas Berna...",
        avatar: imgLucas,
        isTeamLead: false,
        teamId: "team-elodie",
        metrics: { bienveillance: 6.30, apport: 9.60, positivite: 7.40, accomplissement: 9.20, bienEtre: 8.80, plaisir: 6.10, enps: "N/A" },
        drapeaux: { green: 7, orange: 14, red: 6 },
        monthlyData: [7.2, 7.8, 8.1, 7.5, 7.9, 8.3, 7.6, 8.0, 7.4, 7.7, 8.2, 7.9],
      },
      {
        id: "sophie-sub",
        name: "Sophie Dub...",
        avatar: imgSophie,
        isTeamLead: false,
        teamId: "team-elodie",
        metrics: { bienveillance: 9.50, apport: 7.20, positivite: 8.90, accomplissement: 5.80, bienEtre: 9.60, plaisir: 7.90, enps: "N/A" },
        drapeaux: { green: 10, orange: 9, red: 5 },
        monthlyData: [8.8, 9.0, 8.7, 9.1, 8.9, 8.6, 9.2, 8.8, 8.5, 9.0, 8.7, 8.9],
      },
    ],
  },
  {
    id: "camille-lefevre",
    name: "Camille Lefèvre",
    avatar: imgCamille,
    isTeamLead: true,
    teamId: "team-camille",
    metrics: { bienveillance: 7.80, apport: 9.40, positivite: 6.60, accomplissement: 8.90, bienEtre: 7.50, plaisir: 9.20, enps: "N/A" },
    drapeaux: { green: 11, orange: 6, red: 3 },
    monthlyData: [7.6, 8.0, 8.3, 7.9, 8.2, 8.5, 8.1, 7.8, 8.4, 8.0, 7.7, 8.2],
    members: [
      { id: "cam-m1", name: "Lucas Bernard", avatar: imgLucas, isTeamLead: false, teamId: "team-camille", metrics: { bienveillance: 8.10, apport: 9.60, positivite: 6.20, accomplissement: 7.80, bienEtre: 8.90, plaisir: 7.40, enps: "N/A" }, drapeaux: { green: 9, orange: 5, red: 2 }, monthlyData: [7.8, 8.1, 8.4, 8.0, 8.3, 8.6, 8.2, 7.9, 8.5, 8.1, 7.8, 8.3] },
      { id: "cam-m2", name: "Sophie Dubois", avatar: imgSophie, isTeamLead: false, teamId: "team-camille", metrics: { bienveillance: 6.90, apport: 8.70, positivite: 7.40, accomplissement: 9.50, bienEtre: 6.80, plaisir: 9.70, enps: "N/A" }, drapeaux: { green: 12, orange: 7, red: 1 }, monthlyData: [7.2, 7.6, 7.9, 7.5, 7.8, 8.1, 7.7, 7.4, 8.0, 7.6, 7.3, 7.8] },
      { id: "cam-m3", name: "Julien Dupont", avatar: imgJulien, isTeamLead: false, teamId: "team-camille", metrics: { bienveillance: 8.50, apport: 9.10, positivite: 6.80, accomplissement: 8.30, bienEtre: 7.20, plaisir: 8.90, enps: "N/A" }, drapeaux: { green: 10, orange: 8, red: 3 }, monthlyData: [8.0, 8.4, 8.7, 8.3, 8.6, 8.9, 8.5, 8.2, 8.8, 8.4, 8.1, 8.6] },
    ],
  },
  {
    id: "luc-dubois",
    name: "Luc Dubois",
    avatar: imgLuc,
    isTeamLead: true,
    teamId: "team-luc",
    metrics: { bienveillance: 6.10, apport: 8.30, positivite: 9.60, accomplissement: 7.20, bienEtre: 5.90, plaisir: 8.80, enps: "N/A" },
    drapeaux: { green: 12, orange: 10, red: 7 },
    monthlyData: [6.8, 7.2, 7.5, 7.0, 7.3, 6.9, 7.4, 7.1, 6.7, 7.3, 7.5, 7.2],
    members: [
      { id: "luc-m1", name: "Élodie Moreau", avatar: imgElodie2, isTeamLead: false, teamId: "team-luc", metrics: { bienveillance: 5.80, apport: 8.60, positivite: 9.20, accomplissement: 7.50, bienEtre: 6.30, plaisir: 8.40, enps: "N/A" }, drapeaux: { green: 8, orange: 11, red: 5 }, monthlyData: [6.5, 6.9, 7.2, 6.8, 7.1, 6.7, 7.2, 6.9, 6.4, 7.0, 7.2, 6.9] },
      { id: "luc-m2", name: "Camille Lefè...", avatar: imgCamille2, isTeamLead: false, teamId: "team-luc", metrics: { bienveillance: 6.70, apport: 7.90, positivite: 9.40, accomplissement: 6.80, bienEtre: 5.60, plaisir: 9.10, enps: "N/A" }, drapeaux: { green: 13, orange: 9, red: 6 }, monthlyData: [7.1, 7.5, 7.8, 7.4, 7.7, 7.3, 7.8, 7.5, 7.0, 7.6, 7.8, 7.5] },
      { id: "luc-m3", name: "Nicolas Martin", avatar: imgNicolas, isTeamLead: false, teamId: "team-luc", metrics: { bienveillance: 6.40, apport: 8.10, positivite: 9.80, accomplissement: 7.90, bienEtre: 5.70, plaisir: 8.60, enps: "N/A" }, drapeaux: { green: 11, orange: 10, red: 8 }, monthlyData: [6.9, 7.3, 7.6, 7.2, 7.5, 7.1, 7.6, 7.3, 6.8, 7.4, 7.6, 7.3] },
      { id: "luc-m4", name: "Sophie Lambert", avatar: imgSophieL, isTeamLead: false, teamId: "team-luc", metrics: { bienveillance: 5.60, apport: 8.50, positivite: 9.70, accomplissement: 6.60, bienEtre: 6.10, plaisir: 9.20, enps: "N/A" }, drapeaux: { green: 14, orange: 8, red: 7 }, monthlyData: [6.7, 7.1, 7.4, 7.0, 7.3, 6.9, 7.4, 7.1, 6.6, 7.2, 7.4, 7.1] },
    ],
  },
  {
    id: "julien-martel",
    name: "Julien Martel",
    avatar: imgJulienM,
    isTeamLead: true,
    teamId: "team-julien",
    metrics: { bienveillance: 9.10, apport: 6.50, positivite: 8.40, accomplissement: 5.70, bienEtre: 9.30, plaisir: 7.00, enps: "N/A" },
    drapeaux: { green: 14, orange: 8, red: 4 },
    monthlyData: [7.9, 7.6, 8.0, 8.3, 7.7, 7.4, 7.8, 8.1, 7.5, 7.9, 8.2, 7.8],
    members: [
      { id: "jul-m1", name: "Lucas Bernard", avatar: imgLucas, isTeamLead: false, teamId: "team-julien", metrics: { bienveillance: 9.40, apport: 6.20, positivite: 8.10, accomplissement: 5.50, bienEtre: 9.60, plaisir: 6.80, enps: "N/A" }, drapeaux: { green: 12, orange: 7, red: 3 }, monthlyData: [7.6, 7.3, 7.7, 8.0, 7.4, 7.1, 7.5, 7.8, 7.2, 7.6, 7.9, 7.5] },
      { id: "jul-m2", name: "Élodie More...", avatar: imgElodie2, isTeamLead: false, teamId: "team-julien", metrics: { bienveillance: 8.80, apport: 6.80, positivite: 8.70, accomplissement: 5.90, bienEtre: 9.10, plaisir: 7.20, enps: "N/A" }, drapeaux: { green: 15, orange: 9, red: 5 }, monthlyData: [8.1, 7.8, 8.2, 8.5, 7.9, 7.6, 8.0, 8.3, 7.7, 8.1, 8.4, 8.0] },
      { id: "jul-m3", name: "Sophie Dub...", avatar: imgSophie, isTeamLead: false, teamId: "team-julien", metrics: { bienveillance: 9.20, apport: 6.40, positivite: 8.20, accomplissement: 5.60, bienEtre: 9.40, plaisir: 6.90, enps: "N/A" }, drapeaux: { green: 13, orange: 8, red: 4 }, monthlyData: [7.8, 7.5, 7.9, 8.2, 7.6, 7.3, 7.7, 8.0, 7.4, 7.8, 8.1, 7.7] },
    ],
  },
  {
    id: "nicolas-girard",
    name: "Nicolas Girard",
    avatar: imgNicolas,
    isTeamLead: true,
    teamId: "team-nicolas",
    metrics: { bienveillance: 8.70, apport: 9.50, positivite: 7.30, accomplissement: 9.40, bienEtre: 6.80, plaisir: 8.10, enps: "N/A" },
    drapeaux: { green: 10, orange: 12, red: 3 },
    monthlyData: [8.3, 8.7, 8.5, 9.0, 8.8, 8.4, 8.6, 9.1, 8.7, 8.9, 8.5, 8.8],
    members: [
      { id: "nic-m1", name: "Julien Martel", avatar: imgJulienM, isTeamLead: false, teamId: "team-nicolas", metrics: { bienveillance: 8.40, apport: 9.70, positivite: 7.10, accomplissement: 9.60, bienEtre: 6.50, plaisir: 8.30, enps: "N/A" }, drapeaux: { green: 9, orange: 11, red: 2 }, monthlyData: [8.0, 8.4, 8.2, 8.7, 8.5, 8.1, 8.3, 8.8, 8.4, 8.6, 8.2, 8.5] },
      { id: "nic-m2", name: "Camille Lefè...", avatar: imgCamille2, isTeamLead: false, teamId: "team-nicolas", metrics: { bienveillance: 9.00, apport: 9.20, positivite: 7.50, accomplissement: 9.10, bienEtre: 7.10, plaisir: 7.90, enps: "N/A" }, drapeaux: { green: 11, orange: 13, red: 4 }, monthlyData: [8.5, 8.9, 8.7, 9.2, 9.0, 8.6, 8.8, 9.3, 8.9, 9.1, 8.7, 9.0] },
      { id: "nic-m3", name: "Luc Dubois", avatar: imgLuc, isTeamLead: false, teamId: "team-nicolas", metrics: { bienveillance: 8.60, apport: 9.60, positivite: 7.20, accomplissement: 9.30, bienEtre: 6.70, plaisir: 8.20, enps: "N/A" }, drapeaux: { green: 10, orange: 12, red: 3 }, monthlyData: [8.2, 8.6, 8.4, 8.9, 8.7, 8.3, 8.5, 9.0, 8.6, 8.8, 8.4, 8.7] },
    ],
  },
  {
    id: "sophie-lambert",
    name: "Sophie Lambert",
    avatar: imgSophieL,
    isTeamLead: true,
    teamId: "team-sophie",
    metrics: { bienveillance: 7.00, apport: 8.90, positivite: 9.70, accomplissement: 6.80, bienEtre: 8.40, plaisir: 5.60, enps: "N/A" },
    drapeaux: { green: 8, orange: 14, red: 9 },
    monthlyData: [7.5, 7.9, 8.2, 7.7, 8.0, 8.4, 7.8, 7.6, 8.1, 7.9, 8.3, 7.8],
    members: [
      { id: "sop-m1", name: "Élodie More...", avatar: imgElodie2, isTeamLead: false, teamId: "team-sophie", metrics: { bienveillance: 7.30, apport: 9.10, positivite: 9.40, accomplissement: 6.50, bienEtre: 8.70, plaisir: 5.80, enps: "N/A" }, drapeaux: { green: 7, orange: 13, red: 8 }, monthlyData: [7.2, 7.6, 7.9, 7.4, 7.7, 8.1, 7.5, 7.3, 7.8, 7.6, 8.0, 7.5] },
      { id: "sop-m2", name: "Lucas Bernard", avatar: imgLucas, isTeamLead: false, teamId: "team-sophie", metrics: { bienveillance: 6.60, apport: 8.60, positivite: 9.90, accomplissement: 7.10, bienEtre: 8.00, plaisir: 5.40, enps: "N/A" }, drapeaux: { green: 9, orange: 15, red: 10 }, monthlyData: [7.7, 8.1, 8.4, 7.9, 8.2, 8.6, 8.0, 7.8, 8.3, 8.1, 8.5, 8.0] },
      { id: "sop-m3", name: "Julien Dupo...", avatar: imgJulien, isTeamLead: false, teamId: "team-sophie", metrics: { bienveillance: 7.10, apport: 9.00, positivite: 9.60, accomplissement: 6.90, bienEtre: 8.50, plaisir: 5.70, enps: "N/A" }, drapeaux: { green: 8, orange: 14, red: 9 }, monthlyData: [7.4, 7.8, 8.1, 7.6, 7.9, 8.3, 7.7, 7.5, 8.0, 7.8, 8.2, 7.7] },
      { id: "sop-m4", name: "Sophie Dub...", avatar: imgSophie, isTeamLead: false, teamId: "team-sophie", metrics: { bienveillance: 7.20, apport: 8.80, positivite: 9.50, accomplissement: 6.70, bienEtre: 8.20, plaisir: 5.90, enps: "N/A" }, drapeaux: { green: 8, orange: 14, red: 9 }, monthlyData: [7.3, 7.7, 8.0, 7.5, 7.8, 8.2, 7.6, 7.4, 7.9, 7.7, 8.1, 7.6] },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────

function BloopLogo() {
  return (
    <svg width="110" height="40" viewBox="0 0 184 67" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#bloop-clip)">
        <path d="M46.82 3.73975C46.82 1.67434 45.1334 0 43.0529 0C40.9724 0 39.2858 1.67434 39.2858 3.73975V48.4548C39.2858 50.5202 40.9724 52.1946 43.0529 52.1946C45.1334 52.1946 46.82 50.5202 46.82 48.4548V3.73975Z" fill="#111111"/>
        <path d="M68.3474 16.9513C58.5375 16.9513 50.5891 24.8417 50.5891 34.5709C50.5891 44.3 58.5416 52.1904 68.3474 52.1904C78.1531 52.1904 86.1057 44.3 86.1057 34.5709C86.1057 24.8417 78.1531 16.9513 68.3474 16.9513ZM68.3474 44.7151C62.6999 44.7151 58.1233 40.1743 58.1233 34.5709C58.1233 28.9675 62.6999 24.4267 68.3474 24.4267C73.9949 24.4267 78.5715 28.9675 78.5715 34.5709C78.5715 40.1743 73.9949 44.7151 68.3474 44.7151Z" fill="#111111"/>
        <path d="M107.633 16.9513C97.8274 16.9513 89.8749 24.8417 89.8749 34.5709C89.8749 44.3 97.8274 52.1904 107.633 52.1904C117.439 52.1904 125.391 44.3 125.391 34.5709C125.391 24.8417 117.439 16.9513 107.633 16.9513ZM107.633 44.7151C101.986 44.7151 97.4091 40.1743 97.4091 34.5709C97.4091 28.9675 101.986 24.4267 107.633 24.4267C113.281 24.4267 117.857 28.9675 117.857 34.5709C117.857 40.1743 113.281 44.7151 107.633 44.7151Z" fill="#111111"/>
        <path d="M0 46.558V50.5966C0 52.6595 1.68589 54.3363 3.76919 54.3363C4.98654 54.3363 6.06584 53.7594 6.75609 52.8711C4.07039 51.2773 1.76119 49.1189 0.00418334 46.558H0Z" fill="#00B7AE"/>
        <path d="M7.53419 15.8265V5.88149C7.53419 3.81861 5.84831 2.14174 3.76501 2.14174C1.6817 2.14174 0 3.81861 0 5.88149V22.5879C1.92852 19.7821 4.51382 17.4535 7.53419 15.8265Z" fill="#00B7AE"/>
        <path d="M17.7583 16.9513C7.95253 16.9513 0 24.8417 0 34.5709C0 44.3 7.95253 52.1904 17.7583 52.1904C27.564 52.1904 35.5166 44.3 35.5166 34.5709C35.5166 24.8417 27.564 16.9513 17.7583 16.9513ZM17.7583 44.7151C12.1108 44.7151 7.53419 40.1743 7.53419 34.5709C7.53419 28.9675 12.1108 24.4267 17.7583 24.4267C23.4058 24.4267 27.9824 28.9675 27.9824 34.5709C27.9824 40.1743 23.4058 44.7151 17.7583 44.7151Z" fill="#111111"/>
        <path d="M129.06 46.4916V63.2644C129.06 65.3273 130.746 67.0041 132.829 67.0041C134.908 67.0041 136.599 65.3314 136.599 63.2644V53.2945C133.57 51.655 130.985 49.3182 129.064 46.4957L129.06 46.4916Z" fill="#00B7AE"/>
        <path d="M135.829 16.2913C135.143 15.3907 134.055 14.8096 132.829 14.8096C130.75 14.8096 129.06 16.4823 129.06 18.5493V22.6585C130.817 20.0768 133.131 17.9018 135.829 16.2955V16.2913Z" fill="#00B7AE"/>
        <path d="M164.577 34.5709C164.577 24.8376 156.624 16.9513 146.818 16.9513C137.013 16.9513 129.06 24.8417 129.06 34.5709C129.06 44.3 137.013 52.1904 146.818 52.1904C156.624 52.1904 164.577 44.3 164.577 34.5709ZM157.043 34.5709C157.043 40.1743 152.466 44.7151 146.818 44.7151C141.171 44.7151 136.594 40.1743 136.594 34.5709C136.594 28.9675 141.171 24.4266 146.818 24.4266C152.466 24.4266 157.043 28.9675 157.043 34.5709Z" fill="#111111"/>
        <path d="M175.349 26.4978C175.935 26.2488 176.453 25.9126 176.901 25.4809C177.349 25.0534 177.696 24.5429 177.947 23.9618C178.198 23.3807 178.319 22.7539 178.319 22.0815C178.319 21.9944 178.286 21.903 178.277 21.8159L182.716 25.9458C182.946 26.1575 183.28 26.2073 183.565 26.0703C183.82 25.9458 183.979 25.6885 183.979 25.4062V18.404C183.979 17.9641 183.619 17.6071 183.176 17.6071C182.732 17.6071 182.373 17.9641 182.373 18.404V23.6007L177.445 19.1097C177.227 18.9104 176.913 18.8482 176.633 18.9519C176.181 19.118 175.989 19.6368 176.211 20.0602C176.252 20.1432 176.294 20.222 176.328 20.3009C176.466 20.6122 176.562 20.9027 176.612 21.1767C176.662 21.4465 176.688 21.6955 176.688 21.928C176.688 22.5672 176.55 23.1316 176.269 23.6214C175.989 24.1112 175.6 24.4931 175.102 24.767C174.604 25.0451 174.023 25.1821 173.362 25.1821C172.701 25.1821 172.132 25.0285 171.613 24.7255C171.09 24.4184 170.68 24.0116 170.379 23.5011C170.078 22.9905 169.927 22.4302 169.927 21.82C169.927 21.3261 170.007 20.8571 170.17 20.4213C170.333 19.9854 170.601 19.5579 170.973 19.1429C171.212 18.8772 171.504 18.6199 171.847 18.3625C172.19 18.1052 172.287 17.6237 172.057 17.2543C171.801 16.8475 171.249 16.7355 170.856 17.0177C170.053 17.5905 169.459 18.1965 169.078 18.8357C168.584 19.6575 168.342 20.608 168.342 21.6872C168.342 22.6626 168.568 23.5426 169.015 24.3312C169.463 25.1198 170.074 25.7383 170.843 26.1865C171.613 26.639 172.475 26.8631 173.429 26.8631C174.119 26.8631 174.759 26.7386 175.345 26.4895L175.349 26.4978Z" fill="#111111"/>
        <path d="M184 33.72C184 33.446 183.854 33.197 183.619 33.06L180.193 31.0553C179.549 30.6775 178.926 30.3413 178.323 30.0508C177.721 29.7602 177.144 29.5112 176.595 29.3078C176.043 29.1044 175.537 28.9509 175.077 28.8471C174.617 28.7433 174.194 28.6935 173.809 28.6935C173.015 28.6935 172.287 28.8222 171.617 29.0837C170.948 29.3452 170.371 29.7146 169.877 30.1878C169.383 30.6609 169.007 31.2213 168.743 31.8688C168.48 32.5163 168.346 33.2178 168.346 33.9773C168.346 34.9237 168.58 35.787 169.053 36.5673C169.521 37.3477 170.17 37.962 170.99 38.4144C171.814 38.8668 172.738 39.0909 173.763 39.0909C174.705 39.0909 175.554 38.871 176.319 38.4351C177.081 37.9993 177.696 37.4182 178.156 36.7002C178.62 35.9779 178.85 35.1727 178.85 34.2886C178.85 33.8362 178.788 33.3962 178.662 32.9687C178.537 32.5412 178.344 32.1344 178.089 31.7567C178.081 31.7484 178.072 31.7401 178.064 31.7277C178.57 31.985 179.08 32.2548 179.595 32.5661L182.841 34.3924C183.356 34.6829 183.996 34.3135 183.996 33.7241L184 33.72ZM171.747 36.9284C171.195 36.6254 170.76 36.2062 170.438 35.6832C170.115 35.1603 169.952 34.5709 169.952 33.9151C169.952 33.2593 170.12 32.645 170.446 32.1137C170.776 31.5824 171.216 31.1632 171.768 30.856C172.32 30.5489 172.939 30.3994 173.629 30.3994C174.32 30.3994 174.893 30.553 175.437 30.856C175.981 31.1632 176.411 31.5824 176.734 32.1137C177.056 32.645 177.219 33.2551 177.219 33.94C177.219 34.5792 177.056 35.1644 176.725 35.6874C176.395 36.2104 175.955 36.6254 175.403 36.9326C174.855 37.2397 174.257 37.3933 173.609 37.3933C172.918 37.3933 172.299 37.2397 171.747 36.9326V36.9284Z" fill="#111111"/>
        <path d="M168.346 46.5206C168.346 45.3128 168.681 44.2917 169.346 43.4574C170.011 42.6232 170.94 41.9923 172.128 41.5689C173.316 41.1455 174.663 40.9338 176.173 40.9338C177.683 40.9338 179.047 41.1455 180.227 41.5689C181.406 41.9923 182.331 42.6232 183 43.4574C183.665 44.2917 184 45.3128 184 46.5206C184 47.7285 183.665 48.7454 183 49.5755C182.335 50.4015 181.411 51.0324 180.227 51.4641C179.043 51.8957 177.696 52.1116 176.173 52.1116C174.65 52.1116 173.316 51.8957 172.128 51.4641C170.94 51.0324 170.011 50.4057 169.346 49.5755C168.681 48.7495 168.346 47.7285 168.346 46.5206ZM169.944 46.5289C169.944 47.3466 170.182 48.0481 170.664 48.6292C171.14 49.2103 171.843 49.6585 172.768 49.974C173.692 50.2853 174.818 50.443 176.139 50.443C177.461 50.443 178.608 50.2853 179.524 49.974C180.44 49.6627 181.139 49.2144 181.616 48.6292C182.092 48.0481 182.331 47.3466 182.331 46.5289C182.331 45.7112 182.092 45.0056 181.616 44.4162C181.139 43.8227 180.44 43.3703 179.524 43.059C178.608 42.7477 177.478 42.59 176.139 42.59C174.801 42.59 173.692 42.7477 172.768 43.059C171.843 43.3703 171.14 43.8268 170.664 44.4162C170.187 45.0098 169.944 45.7112 169.944 46.5289Z" fill="#111111"/>
      </g>
      <defs>
        <clipPath id="bloop-clip">
          <rect width="184" height="67" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function CheckboxColored({ checked, color, onChange }: { checked: boolean; color: string; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="shrink-0 rounded-[4px] flex items-center justify-center cursor-pointer transition-all"
      style={{
        width: 20,
        height: 20,
        background: checked ? color : "transparent",
        border: checked ? `1.5px solid ${color}` : "1.5px solid #CECECE",
      }}
    >
      {checked && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path d="M1 4L4.5 7.5L11 1" stroke="#FAFAFA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function FlagBadge({ count, color }: { count: number; color: string }) {
  return (
    <div className="flex items-center gap-[2px]">
      <svg width="10" height="12" viewBox="0 0 10 14" fill="none">
        <path d="M1 1v12M1 1l8 3-8 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#111", fontWeight: 400 }}>x {count}</span>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeFilter, setActiveFilter] = useState("bienveillance");
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["elodie-moreau", "camille-lefevre"]));
  const [assignedColors, setAssignedColors] = useState<Record<string, string>>({
    "elodie-moreau": COLOR_PALETTE[0],
    "camille-lefevre": COLOR_PALETTE[1],
  });
  const [colorIndex, setColorIndex] = useState(2);
  const [searchQuery, setSearchQuery] = useState("");
  const [radarPeriod, setRadarPeriod] = useState("30 derniers jours");
  const [tablePeriod, setTablePeriod] = useState("30j");
  const [radarCollapsed, setRadarCollapsed] = useState(false);
  const [radialCollapsed, setRadialCollapsed] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllMembers = (team: Employee) => {
    if (!team.members) return;
    const memberIds = team.members.map(m => m.id);
    const allSelected = memberIds.every(id => selectedIds.has(id));

    if (allSelected) {
      // Deselect all members
      setSelectedIds(prev => {
        const next = new Set(prev);
        memberIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      // Select all members — each member gets their own unique color
      let idx = colorIndex;
      const newColors: Record<string, string> = {};
      memberIds.forEach(id => {
        if (!assignedColors[id]) {
          newColors[id] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
          idx++;
        }
      });
      if (Object.keys(newColors).length > 0) {
        setAssignedColors(c => ({ ...c, ...newColors }));
        setColorIndex(idx);
      }
      setSelectedIds(prev => {
        const next = new Set(prev);
        memberIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      } else {
        const color = assignedColors[id] ?? COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
        if (!assignedColors[id]) {
          setAssignedColors(c => ({ ...c, [id]: color }));
          setColorIndex(i => i + 1);
        }
        next.add(id);
        return next;
      }
    });
  };

  // For a team lead: compute average of all members' metrics and monthly data
  const computeTeamAverage = (team: Employee): Employee => {
    if (!team.members || team.members.length === 0) return team;
    const m = team.members;
    return {
      ...team,
      metrics: {
        bienveillance:   avg(m.map(e => e.metrics.bienveillance)),
        apport:          avg(m.map(e => e.metrics.apport)),
        positivite:      avg(m.map(e => e.metrics.positivite)),
        accomplissement: avg(m.map(e => e.metrics.accomplissement)),
        bienEtre:        avg(m.map(e => e.metrics.bienEtre)),
        plaisir:         avg(m.map(e => e.metrics.plaisir)),
        enps:            "N/A",
      },
      monthlyData: MONTHS.map((_, i) => avg(m.map(e => e.monthlyData[i]))),
    };
  };

  // Collect resolved entries for the chart (team lead → team average, member → personal)
  const chartEntries = useMemo(() => {
    const entries: { emp: Employee; color: string; label: string }[] = [];
    for (const team of TEAMS) {
      if (selectedIds.has(team.id)) {
        entries.push({
          emp: computeTeamAverage(team),
          color: assignedColors[team.id] ?? COLOR_PALETTE[0],
          label: team.members?.length ? `Équipe ${team.name.split(" ")[0]}` : team.name,
        });
      }
      for (const member of team.members ?? []) {
        if (selectedIds.has(member.id)) {
          entries.push({
            emp: member,
            color: assignedColors[member.id] ?? COLOR_PALETTE[1],
            label: member.name,
          });
        }
      }
    }
    return entries;
  }, [selectedIds, assignedColors]);

  // Radar data: one row per metric, one key per selected team/member
  const RADAR_METRICS = [
    { key: "bienveillance",   label: "Bienveillance",     get: (m: Employee["metrics"]) => m.bienveillance },
    { key: "apport",          label: "Apport",             get: (m: Employee["metrics"]) => m.apport },
    { key: "positivisme",     label: "Positivisme",        get: (m: Employee["metrics"]) => m.positivite },
    { key: "accomplissement", label: "Accomplissement",    get: (m: Employee["metrics"]) => m.accomplissement },
    { key: "bienEtre",        label: "Bien être",          get: (m: Employee["metrics"]) => m.bienEtre },
    { key: "plaisir",         label: "Plaisir au travail", get: (m: Employee["metrics"]) => m.plaisir },
  ];

  const radarData = useMemo(() =>
    RADAR_METRICS.map(metric => {
      const row: Record<string, string | number> = { metric: metric.label };
      for (const { emp } of chartEntries) {
        row[emp.id] = parseFloat(metric.get(emp.metrics).toFixed(2));
      }
      return row;
    }),
  [chartEntries]);

  // Flat list of every employee (team leads + members) for the radial chart
  const allEmployees = useMemo(() => {
    const list: Employee[] = [];
    TEAMS.forEach((team, ti) => {
      list.push(team);
      (team.members ?? []).forEach(m => list.push(m));
    });
    return list;
  }, []);

  // Fixed color per teamId (index-based, stable)
  const teamColors = useMemo(() => {
    const map: Record<string, string> = {};
    TEAMS.forEach((team, i) => {
      const color = COLOR_PALETTE[i % COLOR_PALETTE.length];
      map[team.teamId] = color;
      (team.members ?? []).forEach(m => { map[m.teamId] = color; });
    });
    return map;
  }, []);

  const FILTER_PILLS = [
    { id: "bienveillance", label: "Bienveillance", color: "#6CD3BA", textColor: "#111", icon: "team" },
    { id: "apport", label: "Apport", color: "#00AB8E", textColor: "#FAFAFA", icon: "team" },
    { id: "positivisme", label: "Positivisme", color: "#04604E", textColor: "#FAFAFA", icon: "team" },
    { id: "accomplissement", label: "Accomplissement", color: "#7CBEFF", textColor: "#111", icon: "personal" },
    { id: "bien-etre", label: "Bien être", color: "#1E81FF", textColor: "#FAFAFA", icon: "personal" },
    { id: "plaisir", label: "Plaisir au travail", color: "#0059D3", textColor: "#FAFAFA", icon: "personal" },
    { id: "enps", label: "eNPS", color: "#FAFAFA", textColor: "#111", icon: "smile", border: true },
    { id: "drapeaux", label: "Drapeaux", color: "#FAFAFA", textColor: "#111", icon: "flag", border: true },
  ];

  const tabs = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "teams", label: "Toutes les équipes" },
    { id: "flags", label: "Drapeaux" },
    { id: "myteam", label: "Mon équipe" },
  ];

  const PILL_TO_METRIC: Record<string, keyof Employee["metrics"] | null> = {
    bienveillance: "bienveillance",
    apport: "apport",
    positivisme: "positivite",
    accomplissement: "accomplissement",
    "bien-etre": "bienEtre",
    plaisir: "plaisir",
    enps: null,
    drapeaux: null,
  };

  const METRIC_TO_COL: Record<string, string> = {
    bienveillance: "Bienveillance",
    apport: "Apport",
    positivite: "Positivité",
    accomplissement: "Accompliss.",
    bienEtre: "Bien-être",
    plaisir: "Plaisir",
  };

  const activeMetricKey = PILL_TO_METRIC[activeFilter] ?? null;

  const filteredTeams = TEAMS
    .filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.members || []).some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (!activeMetricKey) return 0;
      return (b.metrics[activeMetricKey] as number) - (a.metrics[activeMetricKey] as number);
    });

  return (
    <div className="min-h-screen w-full" style={{ background: "#F5F6FA", fontFamily: "Montserrat, sans-serif" }}>
      {/* Header */}
      <div className="w-full bg-white" style={{ borderBottom: "1px solid #E8E8E8" }}>
        {/* Top row: logo | search | user */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between" style={{ height: 64 }}>
          <BloopLogo />
          {/* Search bar — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white" style={{ border: "1px solid #E1E1E1", width: 320 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#9CA3AF", fontWeight: 400, flex: 1 }}>Rechercher un employé</span>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded" style={{ background: "#F3F4F6", border: "1px solid #E1E1E1", fontSize: 11, color: "#6B7280", fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}>Ctrl</span>
              <span className="px-1.5 py-0.5 rounded" style={{ background: "#F3F4F6", border: "1px solid #E1E1E1", fontSize: 11, color: "#6B7280", fontFamily: "Montserrat, sans-serif", fontWeight: 500 }}>K</span>
            </div>
          </div>
          {/* Right: search icon (mobile) + notifications + user */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search icon mobile only */}
            <button className="md:hidden w-9 h-9 rounded-full flex items-center justify-center" style={{ border: "1px solid #E1E1E1" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            {/* Notifications */}
            <div className="relative">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center" style={{ border: "1px solid #E1E1E1" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#00B7AE", fontSize: 10, color: "#fff", fontWeight: 700 }}>2</div>
            </div>
            {/* User */}
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={imgJohnDoe} alt="John Doe" className="w-9 h-9 rounded-full object-cover" />
              <span className="hidden md:block" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 15, color: "#111" }}>John Doe</span>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5l5 5 5-5" stroke="#00B7AE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Nav row — horizontal scroll on mobile */}
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex items-center gap-2 md:gap-3 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            const icons: Record<string, JSX.Element> = {
              overview: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
              teams: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
              flags: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
              myteam: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
            };
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="md:flex-1 shrink-0 flex items-center justify-center gap-2 px-4 md:px-5 py-2 rounded-full transition-all"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: active ? 600 : 500,
                  fontSize: 14,
                  background: active ? "#00B7AE" : "transparent",
                  color: active ? "#fff" : "#374151",
                  border: active ? "none" : "1px solid #E1E1E1",
                }}
              >
                {icons[tab.id]}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 md:px-8 py-4 max-w-[1600px] mx-auto">

        {/* KPI Summary Cards */}
        {(() => {
          const allMetrics = ["bienveillance", "apport", "positivite", "accomplissement", "bienEtre", "plaisir"] as const;
          const metricLabels: Record<string, string> = {
            bienveillance: "Bienveillance", apport: "Apport", positivite: "Positivité",
            accomplissement: "Accomplissement", bienEtre: "Bien-être", plaisir: "Plaisir",
          };

          // Card 1 — metric with highest avg across all teams
          const metricAvgs = allMetrics.map(k => ({
            key: k,
            avg: avg(TEAMS.map(t => t.metrics[k] as number)),
          })).sort((a, b) => b.avg - a.avg);
          const topMetric = metricAvgs[0];

          // Card 2 — total red flags
          const totalRedFlags = TEAMS.reduce((s, t) => s + t.drapeaux.red + (t.members ?? []).reduce((ms, m) => ms + m.drapeaux.red, 0), 0);

          // Card 3 — team+metric with highest individual score
          let bestScore = -1, bestTeam = TEAMS[0], bestMetricKey = allMetrics[0];
          for (const t of TEAMS) {
            for (const k of allMetrics) {
              const score = t.metrics[k] as number;
              if (score > bestScore) { bestScore = score; bestTeam = t; bestMetricKey = k; }
            }
          }

          // Card 4 — team with most red flags
          const worstTeam = [...TEAMS].sort((a, b) => b.drapeaux.red - a.drapeaux.red)[0];

          const cards = [
            {
              label: "Point fort global",
              value: metricLabels[topMetric.key],
              unit: `moy. ${topMetric.avg.toFixed(2)} / 10`,
              accent: "#00B7AE",
              bg: "#F0FDFB",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B7AE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              ),
            },
            {
              label: "Drapeaux rouges",
              value: String(totalRedFlags),
              unit: "signalements",
              accent: "#EF4444",
              bg: "#FEF2F2",
              icon: (
                <svg width="20" height="20" viewBox="0 0 12 14" fill="none">
                  <path d="M1.5 1v12M1.5 1l9 3-9 3" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
            {
              label: `Meilleure équipe en ${metricLabels[bestMetricKey]}`,
              value: bestTeam.name.split(" ")[0],
              unit: `${bestScore.toFixed(2)} / 10`,
              accent: "#10B981",
              bg: "#F0FDF4",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ),
            },
            {
              label: "Équipe à surveiller",
              value: worstTeam.name.split(" ")[0],
              unit: `${worstTeam.drapeaux.red} drapeaux rouges`,
              accent: "#F59E0B",
              bg: "#FFFBEB",
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              ),
            },
          ];

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {cards.map(card => (
                <div
                  key={card.label}
                  className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: card.bg, border: `1px solid ${card.accent}22`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: card.accent + "18" }}>
                    {card.icon}
                  </div>
                  <div>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, color: "#6B7280", fontWeight: 500, marginBottom: 1 }}>{card.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 18, fontWeight: 700, color: card.accent }}>{card.value}</span>
                      <span className="hidden sm:inline" style={{ fontFamily: "Montserrat, sans-serif", fontSize: 11, color: "#9CA3AF", fontWeight: 400 }}>{card.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Table section header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: 20, color: "#111" }}>Mes équipes</h2>
            <button
              onClick={() => {
                const allTeamIds = TEAMS.filter(t => t.members?.length).map(t => t.id);
                const allExpanded = allTeamIds.every(id => expandedTeams.has(id));
                setExpandedTeams(allExpanded ? new Set() : new Set(allTeamIds));
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-all"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid #E1E1E1",
                color: "#6B7280",
                background: "#FAFAFA",
              }}
            >
              {TEAMS.filter(t => t.members?.length).every(t => expandedTeams.has(t.id)) ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                  Tout replier
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  Tout déplier
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white" style={{ border: "1px solid #CECECE", width: 200 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CECECE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="flex-1 outline-none bg-transparent text-sm"
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#111", fontWeight: 300 }}
                placeholder="Search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Date filter */}
            <div className="relative">
              <select
                value={tablePeriod}
                onChange={e => setTablePeriod(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 rounded-full bg-white cursor-pointer outline-none"
                style={{ border: "1px solid #E1E1E1", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 500, color: "#111" }}
              >
                <option value="7j">7 derniers jours</option>
                <option value="30j">30 derniers jours</option>
                <option value="3m">3 derniers mois</option>
                <option value="6m">6 derniers mois</option>
                <option value="12m">Derniers 12 mois</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5l5 5 5-5" stroke="#00B7AE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {/* Filter icon */}
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white" style={{ border: "1px solid #00B7AE" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00B7AE" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter pills — removed, each chart has its own filter */}
        {false && (<div className="flex items-center gap-3 mb-4 flex-wrap">
          {FILTER_PILLS.map(pill => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm"
              style={{
                background: activeFilter === pill.id ? pill.color : pill.color,
                color: pill.textColor,
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                border: pill.border ? "1px solid #E1E1E1" : "none",
                opacity: activeFilter === pill.id ? 1 : (pill.id !== activeFilter && ["bienveillance","apport","positivisme","accomplissement","bien-etre","positivisme2"].includes(pill.id) ? 0.75 : 1),
              }}
            >
              {pill.icon === "smile" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              )}
              {pill.icon === "flag" && (
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                  <path d="M1.5 1v12M1.5 1l9 3-9 3" stroke="#2E2E2E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {pill.icon === "team" && (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <circle cx="5" cy="4" r="2.5" stroke={pill.textColor} strokeWidth="1.2" />
                  <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke={pill.textColor} strokeWidth="1.2" />
                  <circle cx="10" cy="4" r="1.8" stroke={pill.textColor} strokeWidth="1.2" />
                  <path d="M12 12c0-1.7-1-3-2.5-3.5" stroke={pill.textColor} strokeWidth="1.2" />
                </svg>
              )}
              {pill.icon === "personal" && (
                <svg width="12" height="13" viewBox="0 0 12 14" fill="none">
                  <circle cx="6" cy="4" r="2.5" stroke={pill.textColor} strokeWidth="1.2" />
                  <path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={pill.textColor} strokeWidth="1.2" />
                </svg>
              )}
              {pill.label}
            </button>
          ))}
        </div>)}

        {/* Table card */}
        <div className="bg-white rounded-2xl mb-4" style={{ boxShadow: "0 2px 16px rgba(196,203,214,0.15)", overflowX: "auto" }}>
          {/* Table header */}
          <div className="flex items-stretch" style={{ borderBottom: "1px solid #E1E1E1" }}>
            <div className="px-4 py-2.5 flex items-center" style={{ width: 260, minWidth: 260, borderBottom: "4px solid transparent" }}>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: "#6B7280" }}>Équipe de</span>
            </div>
            {[
              { label: "Bienveillance", color: "#B2E7D8", metricKey: "bienveillance" },
              { label: "Apport", color: "#1EBFA1", metricKey: "apport" },
              { label: "Positivité", color: "#255C4D", metricKey: "positivite" },
              { label: "Accompliss.", color: "#C8DEF8", metricKey: "accomplissement" },
              { label: "Bien-être", color: "#3580F5", metricKey: "bienEtre" },
              { label: "Plaisir", color: "#184EA1", metricKey: "plaisir" },
            ].map(col => {
              const isActive = activeMetricKey === col.metricKey;
              return (
                <div
                  key={col.label}
                  className="flex-1 flex items-center justify-center py-2.5"
                  style={{
                    borderBottom: `4px solid ${col.color}`,
                    minWidth: 90,
                    background: isActive ? col.color + "22" : "transparent",
                  }}
                >
                  <span style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: isActive ? 800 : 700,
                    fontSize: 13,
                    color: isActive ? "#111" : "#6B7280",
                  }}>
                    {col.label}
                    {isActive && <span style={{ marginLeft: 4, fontSize: 10 }}>↓</span>}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-center py-2.5" style={{ width: 80, minWidth: 80 }}>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 13, color: "#6B7280" }}>eNPS</span>
            </div>
            <div className="flex items-center justify-center py-2.5" style={{ width: 140, minWidth: 140 }}>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 13, color: "#6B7280" }}>Drapeaux</span>
            </div>
          </div>

          {/* Table rows */}
          {filteredTeams.map((team, teamIdx) => {
            const isExpanded = expandedTeams.has(team.id);
            const isSelected = selectedIds.has(team.id);
            const teamColor = assignedColors[team.id];
            const rowBg = teamIdx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";

            return (
              <div key={team.id}>
                {/* Team lead row */}
                <div
                  className="flex items-stretch hover:bg-[#F1FCF9] transition-colors"
                  style={{ background: isSelected ? "#F1FCF9" : rowBg, borderBottom: "1px solid #E1E1E1" }}
                >
                  <div className="flex items-center gap-2 px-3 py-2" style={{ width: 260, minWidth: 260 }}>
                    {/* Expand arrow */}
                    <button
                      onClick={() => team.members && toggleExpand(team.id)}
                      className="w-5 h-5 flex items-center justify-center"
                      style={{ opacity: team.members ? 1 : 0 }}
                    >
                      <svg
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                        style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                      >
                        <path d="M3 2l4 3-4 3" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {/* Color checkbox + indicator */}
                    {(() => {
                      const selectedMembers = (team.members ?? []).filter(m => selectedIds.has(m.id));
                      const hasHiddenSelected = !isExpanded && selectedMembers.length > 0;
                      return (
                        <div className="relative shrink-0">
                          <CheckboxColored
                            checked={isSelected}
                            color={teamColor ?? COLOR_PALETTE[0]}
                            onChange={() => {
                              if (!assignedColors[team.id] && !isSelected) {
                                setAssignedColors(c => ({ ...c, [team.id]: COLOR_PALETTE[colorIndex % COLOR_PALETTE.length] }));
                                setColorIndex(i => i + 1);
                              }
                              toggleSelect(team.id);
                            }}
                          />
                          {hasHiddenSelected && (
                            <div
                              className="absolute flex items-center justify-center rounded-full"
                              style={{
                                width: 14, height: 14,
                                top: -6, right: -6,
                                background: "#1E81FF",
                                border: "1.5px solid #fff",
                                fontSize: 8,
                                fontWeight: 700,
                                color: "#fff",
                                fontFamily: "Montserrat, sans-serif",
                                lineHeight: 1,
                              }}
                            >
                              {selectedMembers.length}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Avatar */}
                    <img src={team.avatar} alt={team.name} className="rounded-full object-cover shrink-0" style={{ width: 32, height: 32 }} />

                    <span className="truncate flex-1 min-w-0" style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#111", fontWeight: 400 }}>{team.name}</span>

                    {/* Select / Deselect all members button */}
                    {team.members && isExpanded && (() => {
                      const allMembersSelected = team.members!.every(m => selectedIds.has(m.id));
                      return (
                        <button
                          onClick={() => toggleSelectAllMembers(team)}
                          className="shrink-0 px-2 py-0.5 rounded-full text-xs transition-all"
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: 11,
                            fontWeight: 600,
                            background: allMembersSelected ? "#FEE2E2" : "#E0F2FE",
                            color: allMembersSelected ? "#EF4444" : "#00B7AE",
                            border: `1px solid ${allMembersSelected ? "#FCA5A5" : "#BAE6FD"}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {allMembersSelected ? "Désélect. tout" : "Sélect. tout"}
                        </button>
                      );
                    })()}
                  </div>

                  {(["bienveillance","apport","positivite","accomplissement","bienEtre","plaisir"] as const).map(col => (
                    <div key={col} className="flex-1 flex items-center justify-center py-2.5" style={{ minWidth: 90 }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#111", fontWeight: 300 }}>{team.metrics[col].toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="flex items-center justify-center gap-1 py-2.5" style={{ width: 80, minWidth: 80 }}>
                    <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#9CA3AF", fontWeight: 300 }}>{team.metrics.enps}</span>
                    {team.metrics.enps === "N/A" && (
                      <span
                        title="Les données eNPS ne sont pas encore disponibles pour cette période. Les résultats seront affichés dès réception des réponses au sondage."
                        style={{ cursor: "help", color: "#CECECE", lineHeight: 1 }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 py-2.5" style={{ width: 140, minWidth: 140 }}>
                    <FlagBadge count={team.drapeaux.green} color="#22C55E" />
                    <FlagBadge count={team.drapeaux.orange} color="#F59E0B" />
                    <FlagBadge count={team.drapeaux.red} color="#EF4444" />
                  </div>
                </div>

                {/* Member rows */}
                {isExpanded && team.members?.map((member, memberIdx) => {
                  const memberSelected = selectedIds.has(member.id);
                  const memberColor = assignedColors[member.id];
                  const memberBg = memberIdx % 2 === 0 ? "#FFFFFF" : "#F1FCF9";

                  return (
                    <div
                      key={member.id}
                      className="flex items-stretch hover:bg-[#E8FAF5] transition-colors"
                      style={{ background: memberSelected ? "#E8FAF5" : memberBg, borderBottom: "1px solid #E1E1E1" }}
                    >
                      <div className="flex items-center gap-2 px-3 py-2" style={{ width: 260, minWidth: 260, paddingLeft: 48 }}>
                        {/* Color checkbox */}
                        <CheckboxColored
                          checked={memberSelected}
                          color={memberColor ?? (teamColor ?? COLOR_PALETTE[1])}
                          onChange={() => {
                            if (!assignedColors[member.id] && !memberSelected) {
                              const c = teamColor ?? COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
                              setAssignedColors(prev => ({ ...prev, [member.id]: c }));
                              if (!teamColor) setColorIndex(i => i + 1);
                            }
                            toggleSelect(member.id);
                          }}
                        />

                        <img src={member.avatar} alt={member.name} className="rounded-full object-cover shrink-0" style={{ width: 32, height: 32 }} />
                        <span className="truncate" style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#111", fontWeight: 400 }}>{member.name}</span>
                      </div>

                      {(["bienveillance","apport","positivite","accomplissement","bienEtre","plaisir"] as const).map(col => (
                        <div key={col} className="flex-1 flex items-center justify-center py-2.5" style={{ minWidth: 90 }}>
                          <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#111", fontWeight: 300 }}>{member.metrics[col].toFixed(2)}</span>
                        </div>
                      ))}

                      <div className="flex items-center justify-center gap-1 py-2.5" style={{ width: 80, minWidth: 80 }}>
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, color: "#9CA3AF", fontWeight: 300 }}>{member.metrics.enps}</span>
                        {member.metrics.enps === "N/A" && (
                          <span
                            title="Les données eNPS ne sont pas encore disponibles pour cette période. Les résultats seront affichés dès réception des réponses au sondage."
                            style={{ cursor: "help", color: "#CECECE", lineHeight: 1 }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2 py-2.5" style={{ width: 140, minWidth: 140 }}>
                        <FlagBadge count={member.drapeaux.green} color="#22C55E" />
                        <FlagBadge count={member.drapeaux.orange} color="#F59E0B" />
                        <FlagBadge count={member.drapeaux.red} color="#EF4444" />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <TeamEvolutionChart chartEntries={chartEntries} />

        <NormalisationChart
          chartEntries={chartEntries}
          allEmployees={allEmployees}
        />

{/* Radar + Radial side by side */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-stretch">

        {/* Radar Chart card */}
        <div className="bg-white rounded-2xl flex-1 min-w-0 flex flex-col" style={{ boxShadow: "0 2px 16px rgba(196,203,214,0.15)", padding: "14px 20px 12px" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 15, color: "#111" }}>
                Comparatif des équipes
              </p>
              {!radarCollapsed && (
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Sélectionnez des équipes ou des membres dans le tableau pour les comparer
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!radarCollapsed && (
                <div className="relative">
                  <select
                    value={radarPeriod}
                    onChange={e => setRadarPeriod(e.target.value)}
                    className="appearance-none pl-4 pr-8 py-2 rounded-full bg-white cursor-pointer outline-none"
                    style={{ border: "1px solid #E1E1E1", fontFamily: "Montserrat, sans-serif", fontSize: 13, fontWeight: 500, color: "#111" }}
                  >
                    {["7 derniers jours", "30 derniers jours", "3 derniers mois", "6 derniers mois", "Derniers 12 mois"].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5l5 5 5-5" stroke="#00B7AE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <button
                onClick={() => setRadarCollapsed(c => !c)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                style={{ border: "1px solid #E1E1E1", background: "#FAFAFA" }}
              >
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: radarCollapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                  <path d="M1 1.5l5 5 5-5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chart */}
          {!radarCollapsed && (<>{chartEntries.length === 0 ? (
            <div className="flex items-center justify-center flex-1" style={{ height: 300 }}>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#CECECE" }}>
                Cochez une équipe ou un membre pour afficher le graphe
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} margin={{ top: 10, right: 60, bottom: 10, left: 80 }}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tickCount={6}
                  tick={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                {chartEntries.map(({ emp, color }) => (
                  <Radar
                    key={`radar-${emp.id}`}
                    name={`radar-${emp.id}`}
                    dataKey={emp.id}
                    stroke={color}
                    fill={color}
                    fillOpacity={0}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color, stroke: color }}
                    isAnimationActive={false}
                  />
                ))}
                <RechartsTooltip
                  content={({ label, payload }) => {
                    if (!payload?.length) return null;
                    const sorted = [...payload].sort((a, b) => (b.value as number) - (a.value as number));
                    return (
                      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontFamily: "Montserrat, sans-serif" }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "#111", marginBottom: 8 }}>{label}</p>
                        {sorted.map((item, i) => {
                          const id = (item.name as string).replace("radar-", "");
                          const entry = chartEntries.find(e => e.emp.id === id);
                          const color = entry?.color ?? "#111";
                          return (
                            <div key={id} className="flex items-center gap-2 mb-1">
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", width: 16 }}>#{i + 1}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color }}>{Number(item.value).toFixed(2)}</span>
                              <span style={{ fontSize: 12, color: "#374151" }}>— {entry?.label ?? id}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {/* Légende en bas */}
          <div className="flex items-center gap-2 flex-wrap mt-3 pt-3" style={{ borderTop: "1px solid #F3F4F6" }}>
            {chartEntries.length === 0 ? (
              <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#CECECE" }}>Aucune sélection</span>
            ) : (
              chartEntries.map(({ emp, label, color }) => (
                <div key={emp.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: color + "18", border: `1px solid ${color}40` }}>
                  <div className="rounded-full shrink-0" style={{ width: 8, height: 8, background: color }} />
                  <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600, color }}>{label}</span>
                </div>
              ))
            )}
          </div>
          </>)}
        </div>

        {/* Radial score chart */}
        <RadialScoreChart allEmployees={allEmployees} teamColors={teamColors} />

        </div>{/* end flex row */}

        {/* Indice de risques psychosociaux */}
        <RisquesPsychosociauxChart chartEntries={chartEntries} />

      </div>
    </div>
  );
}