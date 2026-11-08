import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="D0D7DE", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(tblBorders)

def add_header_footer(doc):
    for s in doc.sections:
        s.different_first_page_header_footer = True
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("RESTRICTED // NAVAL PROVOST & MILITARY INTELLIGENCE CYBER LAB")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = RGBColor(120, 130, 140)

        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        frun = fp.add_run("Basic Cybersecurity & AI for Security Personnel • Module 3 Trainee Practical Guide")
        frun.font.name = "Arial"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = RGBColor(120, 130, 140)

def create_guide_document():
    doc = docx.Document()

    for section in doc.sections:
        section.top_margin = Inches(0.9)
        section.bottom_margin = Inches(0.9)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

    add_header_footer(doc)

    # Palette
    NAVY = RGBColor(11, 37, 69)      # #0B2545
    STEEL = RGBColor(19, 64, 116)    # #134074
    GOLD = RGBColor(180, 130, 30)    # #B4821E
    CHARCOAL = RGBColor(33, 37, 41)  # #212529
    WHITE = RGBColor(255, 255, 255)
    MUTED = RGBColor(90, 100, 110)

    # Helper functions
    def h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = NAVY
        return p

    def h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = STEEL
        return p

    def h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = CHARCOAL
        return p

    def para(text, bold_prefix="", italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Arial'
            r_bold.font.size = Pt(10)
            r_bold.font.bold = True
            r_bold.font.color.rgb = CHARCOAL
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10)
        run.font.italic = italic
        run.font.color.rgb = CHARCOAL
        return p

    def bullet(text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.font.name = 'Arial'
            rb.font.size = Pt(10)
            rb.font.bold = True
            rb.font.color.rgb = CHARCOAL
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10)
        run.font.color.rgb = CHARCOAL
        return p

    def callout(title, body, box_type="directive"):
        # Single cell table with border & background
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.7)
        
        bg_color = "F0F4F8" if box_type == "directive" else "FFF8E1"
        border_color = "0B2545" if box_type == "directive" else "B4821E"
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'  <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
            f'  <w:top w:val="none"/>'
            f'  <w:right w:val="none"/>'
            f'  <w:bottom w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(tcBorders)

        cp = cell.paragraphs[0]
        cp.paragraph_format.space_before = Pt(0)
        cp.paragraph_format.space_after = Pt(3)
        r_title = cp.add_run(f"[{title}] ")
        r_title.font.name = 'Arial'
        r_title.font.bold = True
        r_title.font.size = Pt(10)
        r_title.font.color.rgb = NAVY if box_type == "directive" else GOLD

        r_body = cp.add_run(body)
        r_body.font.name = 'Arial'
        r_body.font.size = Pt(9.5)
        r_body.font.color.rgb = CHARCOAL

        # Spacing after callout
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(2)
        sp.paragraph_format.space_after = Pt(4)

    def terminal_box(lines):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.7)
        set_cell_background(cell, "1E293B") # dark slate
        set_cell_margins(cell, top=120, bottom=120, left=160, right=160)

        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.1

        for i, line in enumerate(lines):
            if i > 0:
                p = cell.add_paragraph()
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.1
            run = p.add_run(line)
            run.font.name = 'Courier New'
            run.font.size = Pt(9)
            if line.startswith("$") or line.startswith("#"):
                run.font.color.rgb = RGBColor(56, 189, 248) # light cyan prompt
                run.font.bold = True
            elif "CRITICAL" in line or "DENIED" in line or "ALERT" in line or "VULNERABLE" in line or "REJECTED" in line:
                run.font.color.rgb = RGBColor(248, 113, 113) # light red
            elif "OK" in line or "PASSED" in line or "VERIFIED" in line or "640" in line:
                run.font.color.rgb = RGBColor(74, 222, 128) # light green
            else:
                run.font.color.rgb = RGBColor(226, 232, 240) # light gray

        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(2)
        sp.paragraph_format.space_after = Pt(4)

    def table_styled(headers, rows, widths=None):
        tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="CBD5E1")

        # Header Row
        hdr_row = tbl.rows[0]
        for idx, h_text in enumerate(headers):
            cell = hdr_row.cells[idx]
            set_cell_background(cell, "0B2545")
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            if widths and idx < len(widths):
                cell.width = widths[idx]
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(h_text)
            run.font.name = 'Arial'
            run.font.size = Pt(9.5)
            run.font.bold = True
            run.font.color.rgb = WHITE

        # Data Rows
        for r_idx, row_data in enumerate(rows):
            row = tbl.rows[r_idx + 1]
            bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                cell = row.cells[c_idx]
                set_cell_background(cell, bg)
                set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
                if widths and c_idx < len(widths):
                    cell.width = widths[c_idx]
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                run = p.add_run(str(val))
                run.font.name = 'Arial'
                run.font.size = Pt(9)
                run.font.color.rgb = CHARCOAL

        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(2)
        sp.paragraph_format.space_after = Pt(4)

    # ==========================================
    # COVER / TITLE BLOCK
    # ==========================================
    p_badge = doc.add_paragraph()
    p_badge.paragraph_format.space_before = Pt(10)
    p_badge.paragraph_format.space_after = Pt(2)
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_badge = p_badge.add_run("NIGERIAN NAVAL PROVOST & MILITARY INTELLIGENCE OPERATIONS")
    r_badge.font.name = 'Arial'
    r_badge.font.size = Pt(12)
    r_badge.font.bold = True
    r_badge.font.color.rgb = STEEL

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(2)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("PRACTICAL SIMULATION LABS: STEP-BY-STEP TRAINEE MANUAL")
    r_title.font.name = 'Arial'
    r_title.font.size = Pt(20)
    r_title.font.bold = True
    r_title.font.color.rgb = NAVY

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(2)
    p_sub.paragraph_format.space_after = Pt(14)
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Course: Basic Cybersecurity and Artificial Intelligence for Security Personnel\nModule 3: Identity, Authentication, Password Security & Access Control")
    r_sub.font.name = 'Arial'
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = MUTED

    # Metadata Banner Table
    meta_headers = ["Document Reference", "Duration / Track", "Target Audience", "Classification"]
    meta_rows = [
        ["NP-TG-MOD3-2026", "3 Weeks (Intensive Tactical Defense)", "Naval Provost & Intelligence Trainees", "RESTRICTED / TRAINING DIRECTIVE"]
    ]
    table_styled(meta_headers, meta_rows, [Inches(1.6), Inches(1.8), Inches(1.8), Inches(1.5)])

    callout("STANDING PROVOST CYBER DIRECTIVE",
            "This practical laboratory manual governs trainee tactical execution inside the Greg CyberLab Simulator. "
            "All simulated network packets, target machines, authorization logs, and authentication servers run inside isolated "
            "software sandboxes. Adherence to military evidence preservation standards, chain of custody, and operational security (OPSEC) "
            "is strictly graded and mandatory.",
            box_type="directive")

    # ==========================================
    # SECTION 1: PLATFORM ACCESS & LAB ORIENTATION
    # ==========================================
    h1("1. Platform Orientation & Simulation Arena Access")
    para("The Greg CyberLab Simulator is a specialized military-grade training platform providing simulated cyber threat environments, "
         "interactive Kali Linux command-line terminals, and tactical provost investigation workbenches. Trainees must access their assigned "
         "laboratories through the following standard operational procedure:")

    bullet(" Access the central portal via web browser at https://cyberlab.gregicthub.com (or local intranet address 10.20.0.10).", "Step 1.1 - Access Portal:")
    bullet(" Use your assigned cadet credentials (e.g., student@gregcyberlab.test / Trainee2026! or your personalized institutional cadet account).", "Step 1.2 - Trainee Authentication:")
    bullet(" Click on the dedicated top navigation link labelled 'Labs' (located prominently on the primary navigation bar). This opens the central Laboratories Arena.", "Step 1.3 - Enter Laboratories Arena:")
    bullet(" Filter by Programme: Select 'Basic Cybersecurity and Artificial Intelligence for Security Personnel' to display the 12 specialized Naval Provost laboratories.", "Step 1.4 - Programme Filtering:")
    bullet(" Review Lab Readiness: Each lab contains tactical scenario briefings, estimated completion times (40–50 minutes), and required minimum scores (75%).", "Step 1.5 - Pre-Lab Readiness:")

    para("Trainees will operate across two specialized workspace modes:")
    bullet(" Features telemetry feeds, graphical audit tools, factor taxonomy matrices, and evidence dispatch forms.", "General Workbench Mode: ")
    bullet(" Full interactive terminal equipped with standard Linux network and forensic utilities (cat, grep, awk, chmod, chown, kill, sha256sum).", "Kali Terminal Mode: ")

    # ==========================================
    # SECTION 2: NP-LAB 09 STEP-BY-STEP GUIDE
    # ==========================================
    h1("2. NP-LAB 09: Digital Identity Verification, Passphrase Hardening & MFA Defense")
    meta_headers = ["Lab Code", "Workspace", "Duration", "Passing Mark", "Module"]
    meta_rows = [["NP-LAB 09", "General Workbench", "45 Minutes", "75% Score", "Module 3 (Identity & Access)"]]
    table_styled(meta_headers, meta_rows, [Inches(1.2), Inches(1.5), Inches(1.1), Inches(1.1), Inches(1.8)])

    h2("2.1 Tactical Scenario Background")
    para("During a Naval Provost cybersecurity readiness inspection across Western Naval Command administrative terminals, automated "
         "auditing scripts flagged widespread usage of predictable, weak passwords by base personnel (including 'naval123', 'Musa2026', and 'Password1'). "
         "Concurrently, multiple naval ratings and duty officers reported receiving unsolicited Multi-Factor Authentication (MFA) push notifications "
         "on their mobile authenticator apps at irregular hours (0200–0400 hrs). Threat actors are waging an MFA Fatigue / Push Bombing campaign. "
         "As Provost Duty Watchstanders, trainees must audit the credentials, enforce passphrase generation rules, categorize authentication factor "
         "taxonomies, and execute emergency push-bombing defense protocols.")

    h2("2.2 Step-by-Step Trainee Execution Procedure")

    h3("Step 1: Access and Inspect Flagged Credentials")
    para("Open your General Workbench. Launch the Credential Audit Inspector by viewing the flagged password database:")
    terminal_box([
        "$ cat /srv/audit/flagged_passwords.txt",
        "----------------------------------------------------------------",
        "USER_ID    ACCOUNT_ROLE       HASH_ALGO    DETECTED_PLAINTEXT   STATUS",
        "----------------------------------------------------------------",
        "usr_8812   Duty Armorer       SHA256       naval123             CRITICAL VULNERABILITY",
        "usr_9401   Logistics Rating   MD5          Musa2026             CRITICAL VULNERABILITY",
        "usr_1044   Communications     SHA256       Password1            CRITICAL VULNERABILITY",
        "usr_2209   Watch Officer      BCRYPT       DeltaBase2026!       WEAK (DICTIONARY + YEAR)",
        "----------------------------------------------------------------",
        "[AUDIT ALERT]: 4 of 4 audited credentials violate Naval Standing Order Cyber-04."
    ])

    h3("Step 2: Crack Time Analysis & Vulnerability Reporting")
    para("Using the built-in entropy calculator on your workbench, calculate the cracking time for the flagged passwords against an adversary equipped "
         "with standard graphics-accelerated dictionary cracking tools (e.g., Hashcat with RockYou wordlists):")
    bullet(" Cracked in 0.002 seconds. It relies entirely on a base name and predictable sequence numbers.", "'naval123': ")
    bullet(" Cracked in 0.041 seconds. Predictable combination of common names and current deployment year.", "'Musa2026': ")
    bullet(" Cracked in 0.001 seconds. Top 10 most common globally breached passwords.", "'Password1': ")
    para("Document in your audit report why adding a single capital letter and year (e.g., 'Musa2026') does NOT constitute a secure military credential.")

    h3("Step 3: Construct a Compliant 4-Word Military Passphrase")
    para("Execute the Passphrase Generation Tool on your workbench following the Trainee Handbook guidelines:")
    bullet(" Must consist of four or more random, unrelated words (e.g., 'anchor-falcon-granite-whistle').", "Word Count: ")
    bullet(" Total length must exceed 16 characters (far superior entropy than short complex passwords).", "Minimum Length: ")
    bullet(" Zero personal references, base names, unit designations, family names, or calendar years.", "Negative Constraints: ")
    terminal_box([
        "$ echo 'anchor falcon granite whistle' | sha256sum",
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  -",
        "[ENTROPY RATING]: 78.4 bits (Estimated crack time: 1,400,000 years under brute-force models)",
        "[STATUS]: APPROVED FOR PROVOST SECURE ENCLAVE ENROLLMENT"
    ])

    h3("Step 4: Categorize Authentication Factors Taxonomy")
    para("Complete the interactive Factor Taxonomy matrix on your workbench by assigning each credential artifact to its exact category:")
    table_styled(
        ["Authentication Factor Category", "Military Examples", "Operational Characteristics"],
        [
            ["Something You Know (Knowledge)", "Passphrase, PIN, Secret Code", "Stored in human memory; vulnerable to shoulder surfing & phishing."],
            ["Something You Have (Possession)", "CAC Smart Card, Hardware Token, OTP App", "Physical object; vulnerable to theft, requires certificate revocation if lost."],
            ["Something You Are (Biometrics)", "Fingerprint, Iris/Retina Scan, Facial Geometry", "Biological attributes; cannot be easily altered or transferred; high non-repudiation."],
            ["Contextual / Somewhere You Are", "Duty Shift Hours, Base IP Subnet, Geofence", "Environmental attributes; automatically rejects login attempts outside base hours/premises."]
        ],
        [Inches(2.0), Inches(2.2), Inches(2.5)]
    )

    h3("Step 5: Triage and Neutralize MFA Push Bombing Attack")
    para("An urgent alert appears on your workbench monitor. Lieutenant Commander Aminu's military smartphone is receiving repeated push notifications "
         "from an unauthorized external IP:")
    terminal_box([
        "$ cat /var/log/mfa_prompts.log | grep -i 'push_prompt'",
        "[02:14:10] PUSH_SENT -> User: aminu.t (LCdr) | IP: 103.22.201.44 (Singapore) | Location: Unknown",
        "[02:14:25] PUSH_SENT -> User: aminu.t (LCdr) | IP: 103.22.201.44 (Singapore) | Status: TIMEOUT",
        "[02:14:40] PUSH_SENT -> User: aminu.t (LCdr) | IP: 103.22.201.44 (Singapore) | Status: TIMEOUT",
        "[02:15:02] PUSH_SENT -> User: aminu.t (LCdr) | IP: 103.22.201.44 (Singapore) | ATTACK_DETECTED: PUSH BOMBING",
        "----------------------------------------------------------------",
        "[ACTION REQUIRED]: Choose defensive action: [1] Approve  [2] Ignore  [3] DENY & REPORT"
    ])
    bullet(" Click or enter option [3] 'DENY & REPORT IMMEDIATELY'.", "Defensive Action: ")
    bullet(" Notice: The attacker already possesses LCdr Aminu's primary username and password, which triggered the MFA prompt in the first place.", "Immediate Finding: ")
    bullet(" Trigger an emergency credential reset order for aminu.t and block IP 103.22.201.44 on the tactical gateway.", "Remediation Step: ")

    h3("Step 6: Answer Knowledge Assessment Questions")
    para("Answer the two end-of-lab readiness questions in the simulator:")
    bullet(" Option A ('Immediately tap Deny and report the incident directly to Provost Cyber Defense Watch'). Explanation: Tapping approve grants instant adversary access.", "Question 1:")
    bullet(" Option A ('Something You Have [possession factor]'). Explanation: Smart cards and physical tokens are tangible physical possession items.", "Question 2:")

    # ==========================================
    # SECTION 3: NP-LAB 10 STEP-BY-STEP GUIDE
    # ==========================================
    h1("3. NP-LAB 10: Account Lifecycle Management, Privileged Access & Credential Theft Triage")
    meta_headers = ["Lab Code", "Workspace", "Duration", "Passing Mark", "Module"]
    meta_rows = [["NP-LAB 10", "Kali Linux Terminal", "45 Minutes", "75% Score", "Module 3 (Identity & Access)"]]
    table_styled(meta_headers, meta_rows, [Inches(1.2), Inches(1.5), Inches(1.1), Inches(1.1), Inches(1.8)])

    h2("3.1 Tactical Scenario Background")
    para("Following a quarterly military rotation across commands, Western Naval Command administrative servers must be audited for "
         "account lifecycle hygiene. Intelligence alerts suggest that transferred officers still retain active root/sudo privileges. "
         "Additionally, the server is under a horizontal password spraying assault attempting a single password ('NavyMarch2026!') across 200 "
         "accounts to bypass account lockout thresholds. Watch personnel also reported receiving suspicious phone calls from an individual "
         "claiming to be 'Navy HQ ICT Support' asking for one-time passwords.")

    h2("3.2 Step-by-Step Trainee Execution Procedure")

    h3("Step 1: Audit Active User Accounts against Transfer Manifest")
    para("Launch your Kali Linux Terminal. Navigate to the provost configuration directory and compare system accounts with the official transfer manifest:")
    terminal_box([
        "$ cd /etc/provost",
        "$ cat transfer_manifest_q1.csv",
        "OFFICER_NAME,SERVICE_NO,POSTING_STATUS,EFFECTIVE_DATE,CLEARANCE_FLAG",
        "Cdr Danjuma K.,NN/1429,TRANSFERRED_EASTERN_COMMAND,2026-01-15,REVOKE_ALL",
        "Lt Ibrahim S.,NN/2104,ACTIVE_STATION,2025-06-10,ACTIVE",
        "Sub-Lt Adebayo O.,NN/3310,ACTIVE_STATION,2025-11-01,ACTIVE",
        "",
        "$ grep -i 'danjuma' /etc/passwd",
        "cdanjuma:x:1042:1042:Cdr Danjuma K.:/home/cdanjuma:/bin/bash",
        "",
        "$ groups cdanjuma",
        "cdanjuma : provost_officers sudo wheel armory_admins",
        "[AUDIT FINDING CRITICAL]: Transferred officer 'cdanjuma' still retains active sudo/wheel rights 45 days post-transfer!"
    ])

    h3("Step 2: Deprovision the Transferred Officer Account")
    para("Execute the tactical account deprovisioning command to revoke sudo privileges and lock the orphaned account:")
    terminal_box([
        "$ sudo usermod -L -s /usr/sbin/nologin cdanjuma",
        "$ sudo gpasswd -d cdanjuma sudo",
        "$ sudo gpasswd -d cdanjuma armory_admins",
        "[STATUS]: Account 'cdanjuma' locked; shell set to nologin; privileged groups stripped."
    ])

    h3("Step 3: Eliminate Shared Duty Accounts")
    para("Audit the system for generic shared watch accounts:")
    terminal_box([
        "$ grep 'provost_shared_duty' /etc/passwd",
        "provost_shared_duty:x:1099:1099:Duty Desk Common Account:/home/shared:/bin/bash",
        "",
        "[PROVOST DISCIPLINARY & SECURITY VIOLATION]:",
        "Shared accounts destroy individual non-repudiation in military forensics.",
        "Remediation: Issue individual named service accounts: 'duty_watch_01_aminu', 'duty_watch_02_okonkwo'."
    ])

    h3("Step 4: Detect and Isolate Horizontal Password Spraying Attack")
    para("Inspect the authentication log (`/var/log/auth.log`) to uncover the low-and-slow horizontal password spray:")
    terminal_box([
        "$ grep 'NavyMarch2026!' /var/log/auth.log | head -n 10",
        "Mar 28 03:01:10 base-srv sshd[14102]: Failed password for invalid user cadet01 from 185.220.101.5 port 44321 ssh2",
        "Mar 28 03:01:14 base-srv sshd[14108]: Failed password for invalid user cadet02 from 185.220.101.5 port 44322 ssh2",
        "Mar 28 03:01:18 base-srv sshd[14114]: Failed password for invalid user rating_desk from 185.220.101.5 port 44323 ssh2",
        "Mar 28 03:01:22 base-srv sshd[14120]: Failed password for invalid user armory_tech from 185.220.101.5 port 44324 ssh2",
        "Mar 28 03:01:26 base-srv sshd[14126]: Accepted password for supply_clerk from 185.220.101.5 port 44325 ssh2",
        "",
        "$ grep '185.220.101.5' /var/log/auth.log | wc -l",
        "200",
        "[FORENSIC SUMMARY]: Attacking IP 185.220.101.5 sprayed single password 'NavyMarch2026!' across 200 accounts.",
        "[BREACH DETECTED]: Account 'supply_clerk' was breached at 03:01:26!"
    ])
    para("Apply the defensive firewall block on the attacking IP address and force an immediate password reset on the compromised account:")
    terminal_box([
        "$ sudo iptables -A INPUT -s 185.220.101.5 -j DROP",
        "$ sudo passwd -l supply_clerk",
        "[DEFENSE CONFIRMED]: IP 185.220.101.5 dropped; supply_clerk credential quarantined."
    ])

    h3("Step 5: Execute Counter-Vishing Protocol")
    para("When answering telephone queries claiming to be 'HQ ICT Support':")
    bullet(" Never disclose OTP codes, passwords, or token digits over voice telephone.", "Rule 1 - Zero Credential Disclosure: ")
    bullet(" Require caller service number, appointment, and military branch extension.", "Rule 2 - Challenge Caller: ")
    bullet(" Hang up and dial the authenticated Provost Operations room extension directly.", "Rule 3 - Out-of-Band Callback: ")

    # ==========================================
    # SECTION 4: NP-LAB 11 STEP-BY-STEP GUIDE
    # ==========================================
    h1("4. NP-LAB 11: Multi-Model Access Control (DAC/MAC/RBAC/ABAC) & Facility Visitor Security")
    meta_headers = ["Lab Code", "Workspace", "Duration", "Passing Mark", "Module"]
    meta_rows = [["NP-LAB 11", "Kali Linux Terminal", "45 Minutes", "75% Score", "Module 3 (Identity & Access)"]]
    table_styled(meta_headers, meta_rows, [Inches(1.2), Inches(1.5), Inches(1.1), Inches(1.1), Inches(1.8)])

    h2("4.1 Tactical Scenario Background")
    para("Physical and logical access security must operate in complete synchronization at the Naval Intelligence Operations Centre (NIOC). "
         "An unscheduled civilian HVAC contractor arrives at the perimeter checkpoint requesting immediate unescorted access to the server vault. "
         "Meanwhile, an internal filesystem audit reveals that classified tactical directories have been configured with world-readable/writable "
         "permissions (chmod 777), violating Discretionary Access Control (DAC) policies. Trainees must enforce physical visitor protocols, "
         "inspect mantrap tailgating logs, and configure DAC, MAC, RBAC, and ABAC controls.")

    h2("4.2 Step-by-Step Trainee Execution Procedure")

    h3("Step 1: Checkpoint Contractor Verification Protocol")
    para("Review the gate visitor pass request on your terminal:")
    table_styled(
        ["Verification Item", "Contractor Claim", "Provost Protocol Action"],
        [
            ["Identity Proof", "Presents commercial company badge", "DEMAND Government-issued ID (National NIN or Driver's License)"],
            ["Work Order Ticket", "Claims 'emergency air conditioning repair'", "CROSS-REFERENCE Base Logistics maintenance registry (No ticket found)"],
            ["Escort Requirement", "Requests to walk alone into server room", "ENFORCE 100% continuous military escort (1:1 ratio) at all times"],
            ["Gate Action", "Contractor requests immediate barrier lift", "DENY ENTRY until Base Logistics Officer signs physical escort form"]
        ],
        [Inches(1.8), Inches(2.2), Inches(2.7)]
    )

    h3("Step 2: Server Room Mantrap & Anti-Tailgating Inspection")
    para("Inspect the physical biometric access log for Door B2 (Server Enclave):")
    terminal_box([
        "$ cat /var/log/facility_door_b2.log | tail -n 8",
        "[08:42:11] SENSOR_ALARM: Door B2 held open > 15 seconds.",
        "[08:42:14] BADGE_READ: Lt C. Okon (Authorized - Badge #4410)",
        "[08:42:16] PRESENCE_SENSOR: 2 bodies detected in mantrap enclosure! Only 1 badge scanned!",
        "[08:42:17] TAILGATING ALERT: Unauthorized individual followed Badge #4410 into airlock!",
        "[08:42:18] MANTRAP INTERLOCK ENGAGED: Exit door LOCKED. Both individuals held in airlock.",
        "[08:42:20] SENTRIES DISPATCHED: Provost sentry team arriving at Door B2.",
        "----------------------------------------------------------------",
        "[PROCEDURE]: Sentry physically separates individuals and issues formal violation citation."
    ])

    h3("Step 3: Audit and Hardening of DAC File Permissions")
    para("In your terminal, navigate to `/data/intel_ops/` and audit directory permissions:")
    terminal_box([
        "$ cd /data/intel_ops",
        "$ ls -la",
        "total 48",
        "drwxr-xr-x  3 root root           4096 Mar 28 02:10 .",
        "-rwxrwxrwx  1 root root          14800 Mar 28 02:12 operation_sea_guard.dat",
        "-rwxrwxrwx  1 root root          18940 Mar 28 02:14 weapons_telemetry_grid.db",
        "-rw-r--r--  1 root root           2100 Mar 28 02:15 duty_roster.txt",
        "",
        "[CRITICAL SECURITY BREACH]: Classified operational files have permissions 777 (rwxrwxrwx).",
        "Any low-privilege guest or malware can overwrite weapons coordinates!"
    ])
    para("Apply hardened octal permissions (`chmod 640`) and assign ownership to the provost intelligence group:")
    terminal_box([
        "$ sudo chown root:provost_intel operation_sea_guard.dat weapons_telemetry_grid.db",
        "$ sudo chmod 640 operation_sea_guard.dat weapons_telemetry_grid.db",
        "$ ls -la",
        "-rw-r-----  1 root provost_intel 14800 Mar 28 02:12 operation_sea_guard.dat",
        "-rw-r-----  1 root provost_intel 18940 Mar 28 02:14 weapons_telemetry_grid.db",
        "",
        "[PERMISSION AUDIT PASSED]: Owner = Read/Write (6); Group = Read-Only (4); Others = ZERO (0)."
    ])

    h3("Step 4: Access Control Models Comparison Matrix")
    para("Categorize the following operational rules into the four access control paradigms:")
    table_styled(
        ["Model", "Core Definition", "Military Implementation Example"],
        [
            ["DAC (Discretionary)", "Owner controls permissions.", "File creator runs `chmod 640` to restrict file access."],
            ["MAC (Mandatory)", "System-enforced clearance labels.", "Rating cannot view 'TOP SECRET' document regardless of owner consent."],
            ["RBAC (Role-Based)", "Access tied to organizational role.", "Only personnel assigned 'Duty Armorer' role can issue ammunition."],
            ["ABAC (Attribute-Based)", "Dynamic contextual attributes.", "Access granted only between 0800-1700 hrs from Base Headquarters IP range."]
        ],
        [Inches(1.5), Inches(2.3), Inches(2.9)]
    )

    # ==========================================
    # SECTION 5: NP-LAB 12 STEP-BY-STEP GUIDE
    # ==========================================
    h1("5. NP-LAB 12: Operation Secure Access: Identity Compromise Response & Provost Incident Triage")
    meta_headers = ["Lab Code", "Workspace", "Duration", "Passing Mark", "Module"]
    meta_rows = [["NP-LAB 12", "General Workbench", "50 Minutes", "75% Score", "Module 3 (Identity & Access)"]]
    table_styled(meta_headers, meta_rows, [Inches(1.2), Inches(1.5), Inches(1.1), Inches(1.1), Inches(1.8)])

    h2("5.1 Tactical Scenario Background")
    para("Operation Secure Access Tabletop Exercise. At 0230 hours during the midnight watch, the Naval Provost Duty Officer is confronted "
         "with five simultaneous incident dispatches. Trainees must prioritize these events according to threat severity, execute immediate "
         "containment protocols, terminate hostile sessions, revoke compromised credentials, and complete the official Naval Provost Incident Report Worksheet.")

    h2("5.2 Triage of Concurrent Incidents")
    table_styled(
        ["Event #", "Incident Description", "Triage Severity", "Immediate Action Required"],
        [
            ["Event 1", "Sub-Lt Adebayo lost military Common Access Smart ID during taxi transit.", "HIGH", "Immediately revoke card certificate in PKI directory."],
            ["Event 2", "Admin account logged in from Eastern European IP 194.26.29.112 accessing Armory DB.", "CRITICAL", "Kill active SSH session, lock account, isolate armory database."],
            ["Event 3", "Duty personnel report unexpected MFA push approval notifications on mobile phones.", "HIGH", "Signal personnel to Deny prompts; force password changes."],
            ["Event 4", "Unbadged individual in maintenance overalls seen exiting server room corridor.", "CRITICAL", "Dispatch armed provost sentries to seal and sweep the area."],
            ["Event 5", "Suspicious flash drive labeled 'Welfare Promotion List 2026' found in muster terminal.", "MEDIUM", "Physical bag-and-tag under evidentiary chain of custody."]
        ],
        [Inches(0.8), Inches(2.7), Inches(1.2), Inches(2.0)]
    )

    h2("5.3 Executing the 5-Step First-Response Sequence")
    bullet(" Identify anomalous telemetry (foreign IP, unexpected push prompts, lost smart cards).", "1. NOTICE: ")
    bullet(" Reject unauthorized approval requests; halt file transfers immediately.", "2. DO NOT APPROVE: ")
    bullet(" Escalate dispatch to Provost Marshal and Joint Cyber Operations Centre.", "3. REPORT: ")
    bullet(" Isolate host, terminate active sockets, revoke PKI smart card certificates.", "4. RECOVER: ")
    bullet(" Fill out official incident worksheets, preserve logs, compute SHA-256 evidence hashes.", "5. DOCUMENT: ")

    h3("Step-by-Step Tactical Remediation Commands")
    terminal_box([
        "$ # 1. Revoke lost CAC smart card certificate for Sub-Lt Adebayo",
        "$ pki-admin cert-revoke --serial 8892-BA41 --reason UNSPECIFIED_LOSS",
        "[REVOCATION CONFIRMED]: Certificate 8892-BA41 added to CRL. Smart card rendered inert.",
        "",
        "$ # 2. Investigate rogue admin session on Armory DB",
        "$ who -u",
        "admin_sec  pts/2        2026-03-28 02:28 (194.26.29.112)  PID 29014",
        "",
        "$ # 3. Terminate active hostile SSH session immediately",
        "$ sudo kill -9 29014",
        "$ sudo usermod -L admin_sec",
        "[CONTAINMENT COMPLETE]: PID 29014 terminated. Account admin_sec locked.",
        "",
        "$ # 4. Calculate cryptographic hash for judicial chain of custody",
        "$ sha256sum /var/log/provost_armory_access.log",
        "7a91fbc34d8e901a88b449102c4820fead8901234bcfae190301490218ab4401  provost_armory_access.log",
        "[CHAIN OF CUSTODY VERIFIED]: Hash recorded for military court-martial proceedings."
    ])

    # ==========================================
    # SECTION 6: INCIDENT REPORT WORKSHEET
    # ==========================================
    h1("6. Standard Naval Provost Incident Report Worksheet (Reference Template)")
    para("Every trainee must complete and submit this formal worksheet at the conclusion of NP-LAB 12. Use the structured template below:")

    table_styled(
        ["Field Header", "Operational Record / Trainee Response Entry"],
        [
            ["Incident Reference No.", "NP-IR-2026-0328-ALPHA"],
            ["Reporting Station / Unit", "Naval Provost Cyber Operations Centre, Western Enclave"],
            ["Duty Watchstander", "Cadet / Rating [Trainee Name & Service Number]"],
            ["Date & Time of Incident", "28 March 2026 | 0230 Hours to 0315 Hours"],
            ["Affected Assets & Systems", "Naval Armory DB (10.20.0.99), CAC Identity Directory, Facility Door B2"],
            ["Incident Classification", "IDENTITY THEFT / UNAUTHORIZED PRIVILEGED ACCESS / PHYSICAL BREACH"],
            ["Adversary Indicators (IOCs)", "External IP: 194.26.29.112 (Session PID 29014), Stolen CAC #8892-BA41"],
            ["Initial Discovery / Notice", "Anomalous SSH login alert on Armory DB; Physical mantrap tailgating sensor trip"],
            ["Containment Actions Taken", "1. Killed PID 29014\n2. Revoked CAC Cert #8892-BA41\n3. Locked admin_sec account\n4. Dispatched armed sentry sweep to Server Enclave"],
            ["Evidence Preserved", "SHA-256 of /var/log/provost_armory_access.log:\n7a91fbc34d8e901a88b449102c4820fead8901234bcfae190301490218ab4401"],
            ["Chain of Custody Officer", "Commander Terungwa Shior (Lead Instructor / Provost Cyber Examiner)"],
            ["Final Case Disposition", "Escalated to Naval Intelligence Headquarters (DNI) for hostile actor attribution."]
        ],
        [Inches(2.2), Inches(4.5)]
    )

    # ==========================================
    # SECTION 7: ASSESSMENT RUBRIC & CHECKLIST
    # ==========================================
    h1("7. Trainee Performance Evaluation & Scoring Rubric")
    para("Trainees must achieve a minimum cumulative score of 75% on each laboratory simulation. Scores are determined based on the following rubric:")

    table_styled(
        ["Grading Component", "Weight", "Passing Standard Criteria"],
        [
            ["Technical Command Execution", "40%", "Accurate syntax for chmod, chown, grep, awk, kill, and pki-admin commands."],
            ["Forensic Evidence Quality", "25%", "Correct SHA-256 hashes, terminal log dumps, and accurate IP/port extraction."],
            ["Incident Report Worksheet", "20%", "Complete factual accuracy, no missing operational fields, proper military terminology."],
            ["Readiness Assessment Q&A", "15%", "Correct answers on multiple-choice and situational challenge questions."]
        ],
        [Inches(2.0), Inches(1.1), Inches(3.6)]
    )

    h2("7.1 Trainee Laboratory Checklist")
    bullet(" Completed credential audit and generated compliant 16+ char 4-word passphrase.", "NP-LAB 09:")
    bullet(" Triaged MFA push bombing and submitted incident alert report.", "NP-LAB 09:")
    bullet(" Deprovisioned transferred officer account ('cdanjuma') and revoked sudo rights.", "NP-LAB 10:")
    bullet(" Extracted horizontal password spray attack (185.220.101.5) from auth.log.", "NP-LAB 10:")
    bullet(" Verified HVAC contractor credentials and enforced 100% military escort.", "NP-LAB 11:")
    bullet(" Remediated world-writable permissions on classified files to chmod 640.", "NP-LAB 11:")
    bullet(" Prioritized 5 simultaneous tabletop security events by threat level.", "NP-LAB 12:")
    bullet(" Terminated hostile SSH session PID 29014 and revoked lost smart card certificate.", "NP-LAB 12:")
    bullet(" Submitted signed Naval Provost Incident Report Worksheet with SHA-256 hashes.", "NP-LAB 12:")

    output_paths = [
        r"c:\laragon\www\greg-cyberlab-simulator\public\downloads\Navy_Trainee_Guide_Module_3_Simulation_Labs.docx",
        r"c:\laragon\www\greg-cyberlab-simulator\Navy_Trainee_Guide_Module_3_Simulation_Labs.docx",
        r"C:\Users\Engr.J.S.Obeya\.gemini\antigravity\brain\1cc0ed7e-1f99-4b8e-b12a-79656df7f7d0\Navy_Trainee_Guide_Module_3_Simulation_Labs.docx"
    ]

    for p in output_paths:
        try:
            os.makedirs(os.path.dirname(p), exist_ok=True)
            doc.save(p)
            print(f"Successfully generated Word document at: {p}")
        except Exception as e:
            print(f"Error saving to {p}: {e}")

if __name__ == "__main__":
    create_guide_document()

