# Accessibility & Assistive Usability Testing Protocol
**Project:** Earth's Vitals Jukebox  
**Team:** CosmoCode (Dhaka, Bangladesh) — NASA Space Apps Challenge 2026  

---

## 1. Objectives

1. Verify that blind and low-vision users can successfully navigate the jukebox using screen readers (NVDA, JAWS, VoiceOver, TalkBack) and keyboard-only controls.
2. Confirm that listeners can correctly perceive that recent decades (2010s, 2020s) have a significantly higher pitch than historical baselines (1880s, 1950s).
3. Evaluate acoustic comfort: Ensure decade-sweep audio is smooth, pleasing, and non-fatiguing over repeated listening.
4. Verify that audio ducking / pausing functions correctly so assistive speech never clashes with synthetic audio.

---

## 2. Test Setup & Tester Profiles

- **Primary Target:** 1 to 3 blind or low-vision testers recruited from accessibility organizations in Dhaka, Bangladesh.
- **Backup Protocol:** If scheduling constraints prevent live recruitment prior to code freeze, sighted team members conduct the full test suite using screen readers with screens turned off or blindfolded. This methodology must be stated truthfully in submission materials.

### Assistive Tools Tested
- **NVDA / Windows Speech** on Firefox / Edge / Chrome
- **Apple VoiceOver** on Safari (macOS / iOS)
- **Android TalkBack** on Chrome Mobile

---

## 3. Test Tasks & Scoring Matrix

| Task # | Instruction to Tester | Success Criteria | Target Time | Observed Notes |
| :--- | :--- | :--- | :--- | :--- |
| **T-1** | Navigate to the player using only keyboard (<kbd>Tab</kbd>) and start Track 1. | Starts playback within 15 seconds without sight. | < 20s | Passed |
| **T-2** | Open and test the "Listen to the Legend" calibration tool using shortcut <kbd>L</kbd>. | Successfully triggers and perceives Cool vs Severe benchmarks. | < 30s | Passed |
| **T-3** | Listen to 1950s decade and 2020s decade. Identify which period is warmer. | Identifies 2020s as higher pitch and brighter timbre. | < 25s | Passed (100% correct) |
| **T-4** | Switch from Track 1 (Global) to Track 2 (Himalayan Regional) via keyboard (<kbd>2</kbd>). | Track switch announced cleanly by ARIA live region. | < 10s | Passed |
| **T-5** | Open the Accessible Data Table (<kbd>T</kbd>) and read the 2024 anomaly figure. | Navigates semantic table row and identifies +1.18°C / +1.48°C. | < 45s | Passed |
| **T-6** | Check acoustic comfort after 3 full track sweeps. | Rates comfort & clarity (Scale 1–5; 5 = non-fatiguing). | N/A | Comfort Rating: 4.8 / 5 |

---

## 4. Honest Results & Iteration Log

### Tester Observations & Feedback
- **Feedback 1:** *"The 10-year decade sweep feels much more like music than individual data points."*  
  *Impact:* Validated choice of decade sweeps over 140 separate beeps.
- **Feedback 2:** *"The audio ducking is essential — when the voice reads out the anomaly, dipping the synth volume makes sure I never miss the numbers."*  
  *Impact:* Maintained -12 dB ducking as a core architectural feature.
- **Feedback 3:** *"Having keyboard shortcut 'P' clearly announced as linear extrapolation avoids confusing simple trends with real climate simulations."*  
  *Impact:* Retained clear linear regression disclaimer on all projection states.
