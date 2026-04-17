# [Project Name] [Anemia]
## Product Requirements Document

> **TRA460: Digital Health Implementation** | Chalmers University of Technology

> **v1.0 Section Guide:**
> - **[Required]** — Must be substantive for this submission to pass.
> - **[Recommended]** — Optional for v1.0, but strengthens your foundation.
> - **[Expand Later]** — Scaffolding for future iterations. Initial thoughts welcome.

---

### Project Details [Required]

| Field               | Value                                      |
|---------------------|--------------------------------------------|
| **Group**           | TRA460_Group_2                            |
| **Version**         | 1.0                                        |
| **Date**            | 2026-04-17                                 |
| **Clinical Mentor** | [Lena Von Bahr, , Hematology and Coagulation]                 |
| **Group Members**   | Kerim Gishkaev (Mechatronics), Laura Lahdo (Chemistry), Henrik Hedner (Physiology), Yu-Hsuan Lee (Technical Design) 

---

## 1. Needs Statement [Required]

<!--
  REQUIRED FOR v1.0

  THE CORE OF YOUR PRD.
  Use the Stanford Biodesign format below. Be specific:
  - The verb should describe a function, not a technology.
  - The population should be narrow enough to be actionable.
  - The outcome should be measurable or clearly observable.

  Weak:  "A way to use AI for patients that improves healthcare."
  Strong: "A way to detect early signs of atrial fibrillation
           in post-stroke patients managed in primary care
           that reduces time-to-treatment for recurrent events."
-->

> A way to monitor anemia symptoms for transfusion-dependent patients in the Department of Hematology and Coagulation that reduces unnecessary transfusions, enables early detection of symptom changes between clinic visits, improves patient quality of life, and reduces hospital admissions and emergency visits.


---

### 1.1 Clinical Context & Background [Required]

<!--
  REQUIRED FOR v1.0

  Set the stage. What is the clinical problem space? 





  - What condition, workflow, or care gap are you addressing?
  - How significant is this problem? (incidence, prevalence, burden)
  - Why does it matter — clinically, economically, or humanly?
-->

Transfusion-dependent anemia refers to a group of chronic conditions in which patients require regular red blood cell transfusions to maintain adequate hemoglobin levels and sustain daily functioning. These conditions include, but are not limited to, myelodysplastic syndromes (MDS), thalassemia major, aplastic anemia, and sickle cell disease. Without regular transfusions, patients experience debilitating symptoms such as severe fatigue, shortness of breath, dizziness, and cardiac strain, significantly impacting their quality of life.

The burden of transfusion dependency is substantial — both clinically and humanly. Patients require lifelong management, with transfusion cycles typically occurring every 2 to 6 weeks depending on the underlying condition and individual response. Between scheduled clinic visits, symptom fluctuations often go undetected, leaving patients vulnerable to deterioration before their next appointment. This gap in continuous monitoring can lead to avoidable emergency visits, unplanned hospital admissions, and poorly timed or unnecessary transfusions.

Currently, symptom monitoring in the Department of Hematology and Coagulation relies primarily on scheduled visits, meaning clinicians have limited visibility into how patients are feeling between appointments. Patients may underreport symptoms or delay seeking help, further widening this care gap. Addressing this monitoring gap represents a significant opportunity to improve clinical decision-making, optimize transfusion timing, and enhance the overall quality of care for this vulnerable patient population.


### 1.2 Key Clinical Insights [Required]

<!--
  REQUIRED FOR v1.0

 Current Workflow (Status Quo)
Transfusion-dependent patients in Hematology come in for blood checks every 1–2 weeks. The standard transfusion threshold is set at Hb 80 g/dL, though this can be adjusted upward (to 90–100 g/dL) based on the physician's judgment, taking into account the patient's general status and comorbidities. When a patient feels unwell before their scheduled visit, they may contact a nurse to signal the need for a transfusion — but the nurse cannot act on this independently and must escalate to a physician. The decision to adjust a patient's threshold ultimately rests with the doctor, and responses vary significantly between physicians.

Key Observations

There is no scientifically validated threshold for when a transfusion is needed — the 80 g/dL figure is a convention, not evidence-based.
Beyond hemoglobin levels, there are no reliable objective clinical signs to determine transfusion need.
Decisions are largely driven by physician gut feeling, leading to inconsistency between patients and providers.
Wearable parameters (e.g. Fitbit-style data) currently have no proven predictive value for transfusion need. Heart rate variability, for instance, reflects a reaction to hemoglobin changes rather than predicting them.
The goal is to scientifically establish personalized thresholds — proving whether a given patient's threshold should be raised or lowered based on their data.


Friction Points & Risks

Patients may be undertreated, living with lower quality of life than necessary due to rigid or inconsistently applied thresholds.
Nurses are caught in a frustrating middle position — they hear patient complaints but lack the authority to act, creating delays and dissatisfaction.
Unnecessary clinic visits for blood checks add burden to both patients and the system.
Risk of iron overload and cardiac strain from over-transfusion if thresholds are set too liberally.


Data & Monitoring Considerations

The mentor emphasized collecting as many data points as possible, without overwhelming patients — perhaps once per week, or triggered by active symptom reporting.
Monitoring should cover quality of life, fatigue, and subjective symptoms alongside clinical values.
Standardized questionnaires exist but tend to be question-heavy — finding or adapting a validated but lean questionnaire is worth exploring.
The primary audience for collected data is clinicians and researchers, though patient-facing feedback should be considered carefully to inform without overwhelming.
-->

### 1.3 Existing Solutions & Gaps [Required]

<!--
  REQUIRED FOR v1.0

  What solutions or tools exist today for this problem?
  - Clinical tools, apps, devices, workflows

Electronic health records (EHR) with patient portals (e.g. Journal via 1177 in Sweden) — patients can view lab results and message their care team, but there's no active symptom tracking or alerting built in.
Wearables (e.g. Fitbit, Apple Watch) — can track heart rate, SpO₂, fatigue proxies and activity levels, which are all relevant anemia symptoms, but are not designed for or validated in clinical hematology contexts.
General symptom tracking apps (e.g. Bearable, Symple) — allow patients to log fatigue, dizziness, shortness of breath etc., but are generic and not integrated with hematology care workflows.
Hemoglobin point-of-care devices — exist for settings like primary care or home use (e.g. HemoCue), but are not standardized for home use among transfusion-dependent patients.

  - Why are they insufficient, inaccessible, or underused?

Why are they insufficient, inaccessible, or underused?

Not disease-specific — no existing consumer app is tailored to the symptom profile of transfusion-dependent anemia patients.
Not integrated — tools that do exist rarely connect to hospital systems, so clinicians can't act on the data even if it's collected.
Lack of clinical validation — wearables and general apps aren't trusted in clinical decision-making without evidence backing them.
Digital literacy & accessibility barriers — many hematology patients are elderly, making complex apps or wearables difficult to use consistently.
No alerting logic — existing tools don't flag deterioration or trigger contact with care teams proactively.

  - What gap remains that your project could fill?
-->
The gap is a disease-specific, patient-friendly symptom monitoring tool that:

Captures symptoms most relevant to anemia (fatigue, dyspnea, dizziness, palpitations, functional capacity)
Is simple enough for older or unwell patients to use regularly between visits
Can surface trends or alerts to clinicians in a meaningful way
Supports shared decision-making around transfusion timing — reducing both unnecessary transfusions and emergency situations

### 1.4 Success Metrics [Recommended]

<!--
  RECOMMENDED FOR v1.0

  How will you know your solution actually addresses the need?
  Think about the "that..." clause in your Needs Statement —
  how would you measure or observe that outcome?
-->

1. Reduces unnecessary transfusions

Reduction in number of transfusions per patient per month compared to baseline
Percentage of transfusions deemed "clinically necessary" based on symptom + lab correlation
Clinician-reported confidence in transfusion timing decisions

2. Enables early detection of symptom changes between visits

Number of early interventions triggered by app alerts (vs. unplanned emergency visits)
Time between symptom onset and clinical action — is it shorter with the app?
Patient-reported accuracy of the app in reflecting how they actually felt

3. Improves patient quality of life

Validated QoL scores before and after (e.g. FACT-An — a fatigue/anemia-specific scale, or EQ-5D)
Patient-reported sense of control and safety between clinic visits
Adherence rate — are patients actually using it consistently?

4. Reduces hospital admissions and emergency visits

Number of unplanned ER visits or acute admissions per patient over a 3–6 month period
Comparison to historical data or a control group if possible



---

## 2. Stakeholders & Users

### 2.1 Primary User(s) [Required]

<!--
   REQUIRED FOR v1.0

  Who will directly use or interact with your solution day-to-day?
  Be specific: "Cardiac nurses in outpatient clinics" not just "nurses."
-->

The primary users of this solution are transfusion-dependent patients receiving care at the Department of Hematology and Coagulation at Sahlgrenska University Hospital, Gothenburg, Sweden. These patients interact with the solution on a day-to-day basis, using it to self-monitor and report anemia-related symptoms such as fatigue, shortness of breath, and dizziness between scheduled clinic visits. This population is typically managing chronic, long-term conditions requiring ongoing transfusion support, and may range in age, digital literacy, and physical capacity — all of which are important considerations for the design of the solution.


### 2.2 Other Stakeholders [Required]

<!--
  REQUIRED FOR v1.0

  Who else is affected by or has influence over this solution?
  Consider: patients, caregivers, administrators, IT departments,
  payers/insurers, regulators, clinical champions, etc.
-->

Several other stakeholders are affected by or have influence over this solution:
Hematology and Coagulation Nurses & Physicians at Sahlgrenska — Clinical staff who will receive and act on the symptom data generated by patients, using it to inform transfusion scheduling and clinical decisions.
Patients' Caregivers and Family Members — In cases where patients have limited mobility or digital literacy, caregivers may assist in using the solution and have a vested interest in patient wellbeing.
Hospital Administration at Sahlgrenska University Hospital — Decision-makers who influence procurement, implementation, and resource allocation for new clinical tools.
Västra Götalandsregionen (VGR) — As the regional healthcare authority governing Sahlgrenska, VGR plays a role in funding, policy compliance, and broader rollout decisions.
Swedish Medical Products Agency (Läkemedelsverket) — The national regulatory body responsible for approving medical devices and digital health solutions used in clinical settings in Sweden.
IT & Digital Health Department at Sahlgrenska — Responsible for integrating any new solution with existing hospital systems such as the electronic health record (EHR) system (e.g., Millennium/Citrix used in VGR).
Region-wide Payers (VGR/Region Västra Götaland) — As Sweden operates a publicly funded healthcare system, the region funds patient care and would evaluate the cost-effectiveness of implementing this solution.

### 2.3 User Journey — Current State [Recommended]

<!--
  RECOMMENDED FOR v1.0

  Describe the current care pathway or experience of your primary user.
  A simple narrative walkthrough is fine, e.g.:
  "The patient wakes up, measures their..., calls the clinic to..."
-->

---

## 3. Solution Vision [Required]

<!--
  REQUIRED FOR v1.0

  1-2 paragraphs maximum. This is your "north star," not a feature list.
  - What is the high-level concept?
  - How does it directly address the Needs Statement?
  - What does success look like from the user's perspective?

  Keep it directional. You will refine this throughout the course.
-->
The vision is a patient-centered digital monitoring system that bridges the gap between scheduled clinic visits for transfusion-dependent patients at the Department of Hematology and Coagulation at Sahlgrenska University Hospital. The solution combines a simple mobile application for patient self-reporting of anemia symptoms with passive data collection through a wearable sensor, feeding into a clinical dashboard that gives nurses and physicians real-time visibility into each patient's condition between appointments. Rather than waiting for patients to feel unwell enough to call the clinic, the system empowers patients to actively participate in their own care while enabling clinicians to detect early warning signs and act proactively.
Success, from the patient's perspective, looks like feeling seen and supported between visits — knowing that their symptoms are being tracked and that their care team will reach out if something changes. From the clinician's perspective, success means having reliable, continuous data to make more confident and timely decisions about transfusion scheduling, reducing both unnecessary transfusions and preventable emergency admissions. Ultimately, this solution aims to transform anemia management from a reactive, visit-driven model into a proactive, patient-connected care pathway.

---

## 4. Requirements

### 4.1 Functional Requirements (MoSCoW) [Recommended]

<!--
  RECOMMENDED FOR v1.0

  Categorize what your MVP needs to DO.
  Each requirement should be a clear, testable capability.
  A few items per category is enough for v1.0 — this section
  will grow significantly in later iterations.
-->

**Must Have** — *Non-negotiable for a functioning MVP*
- [e.g., Patient can log daily symptom entries via a mobile interface]
-

**Should Have** — *High value, but the MVP could technically function without these*
- [e.g., Clinician receives a weekly summary report of patient-logged data]
-

**Could Have** — *Nice-to-have if time and resources allow*
- [e.g., Push notification reminders for symptom logging]
-

**Won't Have** — *Explicitly out of scope for this project*
- [e.g., Integration with national EHR systems]
-

### 4.2 Non-Functional Requirements & Constraints [Recommended]

<!--
  RECOMMENDED FOR v1.0

  Consider the "invisible" requirements:
  - Data privacy & security (GDPR, patient data handling)
  - Regulatory considerations (MDR, wellness vs. medical device)
  - Accessibility (WCAG, language/localization)
  - Interoperability standards (FHIR, HL7, openEHR)
  - Performance, offline capability
-->

---

## 5. Technical Direction [Expand Later]

<!--
  EXPAND IN LATER ITERATIONS

  Initial thoughts only. No commitments required yet.
  This section helps your future self (and your AI agent, if using
  Claude Code) understand the technical landscape you are considering.
-->

- **Platform:** [iOS / Android / Web / Cross-platform / TBD]
- **Key Integrations:** [EHR systems, wearables, sensors, APIs, etc.]
- **Candidate Tech Stack:** [SpeziVibe, Swift/Kotlin, React, etc. / TBD]
- **Infrastructure:** [Cloud provider, on-premise, hybrid / TBD]

---

## 6. Open Questions & Risks [Required]

<!--
  REQUIRED FOR v1.0

  Be honest about what you don't know yet. This is a sign of
  rigorous thinking, not weakness.
  - What assumptions are you making that haven't been validated?
  - What could block or derail this project?
  - What do you need to ask your clinical mentor next?
-->

What specific anemia conditions are most prevalent in the department's transfusion-dependent patient population? We have not yet confirmed the primary diagnoses (e.g., MDS, thalassemia, sickle cell disease) represented at Sahlgrenska. Plan: Ask clinical mentor in next meeting to obtain a breakdown of the patient population.
What is the digital literacy and technology access level of the patient population? The majority of transfusion-dependent patients tend to be older, and we are assuming they can use a mobile application and/or wearable device. This has not been validated. Plan: Conduct early patient interviews or surveys to assess comfort with technology before committing to a digital-first solution.
What symptoms should be tracked, and how? We are assuming that patient-reported symptoms (e.g., fatigue, breathlessness, dizziness) are clinically meaningful proxies for hemoglobin decline. This needs clinical validation. Plan: Validate with clinical mentor which symptoms are most actionable and at what thresholds.
Will clinicians actually use a dashboard in their existing workflow? We are assuming that nurses and physicians at the department have the capacity and willingness to monitor an additional digital tool between visits. Workflow overload is a real risk. Plan: Map the current clinical workflow with the department and identify where and how alerts could be integrated without adding burden.
What EHR system does Sahlgrenska use, and can the solution integrate with it? Lack of EHR integration could be a significant barrier to clinical adoption. Plan: Confirm the system in use (e.g., Millennium) with the IT or clinical mentor, and assess integration feasibility early.
What are the regulatory requirements for a digital health solution in Sweden? Depending on the classification of the solution (e.g., as a medical device under EU MDR), regulatory approval could significantly impact scope and timeline. Plan: Research Swedish Medical Products Agency (Läkemedelsverket) requirements and EU MDR classification with the team.
Is there patient willingness to be monitored continuously between visits? We are assuming patients will find continuous monitoring acceptable and not intrusive. Privacy concerns or discomfort with data sharing may be a barrier. Plan: Include informed consent and data privacy considerations in early patient interviews.
What does success look like quantitatively? We have defined success qualitatively, but have not yet established measurable outcomes (e.g., % reduction in emergency visits, transfusion frequency). Plan: Define key success metrics together with the clinical mentor before moving into prototyping.

- **[Question/Risk]:** [Your plan to resolve it, and by when]
- **[Question/Risk]:** [Your plan to resolve it, and by when]
-

---

## Changelog [Required]

| Version | Date       | Summary of Changes                                  |
|---------|------------|-----------------------------------------------------|
| 1.0     | YYYY-MM-DD | Initial draft after first clinical mentor meeting   |
|         |            |                                                     |