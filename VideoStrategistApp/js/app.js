document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // Core Navigation & View Router
    // ==========================================
    const views = document.querySelectorAll('.view');
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    const viewport = document.getElementById('viewport');

    function navigateTo(targetId) {
        views.forEach(v => v.classList.remove('active'));
        const target = document.getElementById(targetId);
        if(target) target.classList.add('active');

        // Update Bottom Nav
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.navigate === targetId || 
               (['view-quick', 'view-tester', 'view-tester-output', 'view-wizard'].includes(targetId) && item.dataset.navigate === 'view-home')) {
                item.classList.add('active');
            }
        });
        if (viewport) viewport.scrollTop = 0;
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-navigate]');
        if(trigger) {
            e.preventDefault();
            navigateTo(trigger.dataset.navigate);
        }
    });

    // ==========================================
    // Form & Input Interactivity
    // ==========================================
    
    // Choice Chips (Single and Multi Select)
    document.querySelectorAll('.choice-chips').forEach(group => {
        const isSingle = group.classList.contains('single-select');
        group.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                if (isSingle) {
                    group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                } else {
                    chip.classList.toggle('active');
                }
            });
        });
    });

    // Single-Select Option Buttons (Onboarding & Tags)
    document.querySelectorAll('.ob-options').forEach(group => {
        group.querySelectorAll('.ob-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.ob-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });

    // Segmented Controls (Budget)
    document.querySelectorAll('.segmented-control').forEach(control => {
        control.querySelectorAll('.segment').forEach(seg => {
            seg.addEventListener('click', () => {
                control.querySelectorAll('.segment').forEach(s => s.classList.remove('active'));
                seg.classList.add('active');
            });
        });
    });

    // Collapsible Sections
    document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
        trigger.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.classList.toggle('open');
            const icon = this.querySelector('ion-icon');
            icon.name = content.classList.contains('open') ? 'chevron-up' : 'chevron-down';
        });
    });




    // ==========================================
    // Brand Intelligence Collapsibles
    // ==========================================
    document.querySelectorAll('.brand-collapse-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('ion-icon');
            if (content.style.display === 'none' || content.style.display === '') {
                content.style.display = 'block';
                icon.name = 'remove';
            } else {
                content.style.display = 'none';
                icon.name = 'add';
            }
        });
    });

    document.querySelectorAll('.add-benefit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.previousElementSibling;
            const currentInputs = container.querySelectorAll('.benefit-input').length;
            if (currentInputs < 3) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'benefit-input mb-1';
                input.placeholder = `Benefit ${currentInputs + 1}...`;
                container.appendChild(input);
            }
            if (container.querySelectorAll('.benefit-input').length >= 3) {
                this.style.display = 'none';
            }
        });
    });

    // ==========================================
    // Guided Wizard Flow
    // ==========================================
    const wizSteps = document.querySelectorAll('.wizard-step');
    const wizPrev = document.getElementById('wiz-prev');
    const wizNext = document.getElementById('wiz-next');
    const wizProgress = document.getElementById('wizard-progress-fill');
    const wizStepNum = document.getElementById('wizard-step-num');
    let currentWizStep = 1;

    function renderWiz() {
        wizSteps.forEach(s => s.classList.remove('active'));
        document.querySelector(`.wizard-step[data-step="${currentWizStep}"]`)?.classList.add('active');
        if(wizProgress) wizProgress.style.width = `${(currentWizStep/3)*100}%`;
        if(wizStepNum) wizStepNum.innerText = currentWizStep;
        if(wizPrev) wizPrev.disabled = currentWizStep === 1;
        if(wizNext) wizNext.innerHTML = currentWizStep === 3 ? '<ion-icon name="sparkles"></ion-icon> Generate My Strategy' : 'Next Step';
    }

    wizPrev?.addEventListener('click', () => { if(currentWizStep > 1) { currentWizStep--; renderWiz(); }});
    wizNext?.addEventListener('click', () => { 
        if(currentWizStep < 3) { 
            currentWizStep++; renderWiz(); 
        } else {
            runGenerationMock("wiz");
        }
    });

    // ==========================================
    // Output Tab System
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            // Scroll tabs into view centering
            btn.scrollIntoView({ inline: "center", behavior: 'smooth' });
        });
    });

    // ==========================================
    // Generators & Payload Builders
    // ==========================================

    document.getElementById('btn-run-quick')?.addEventListener('click', () => runStrategyGeneration('quick'));
    document.getElementById('btn-run-tester')?.addEventListener('click', () => runTesterGeneration());

    async function runTesterGeneration() {
        navigateTo('view-loading');
        const msgs = ["Reading your script...", "Analysing hook strength...", "Scoring conversion triggers...", "Building your report..."];
        let count = 0;
        const msgEl = document.getElementById('loading-msg');
        
        let intv = setInterval(() => {
            count++;
            if(count < msgs.length && msgEl) msgEl.innerText = msgs[count];
        }, 800);

        const scriptText = document.getElementById('t-script')?.value || '';
        const systemPrompt = `You are a world-class Direct Response Copywriter and Video Marketing Strategist. 
You are analyzing a user's video script to evaluate its potential to convert viewers and generate a rewritten, high-converting version. 

USER SCRIPT TO ANALYZE:
"""
${scriptText}
"""

Critically analyze this script. Look for strong hooks, pacing, clarity, and call-to-actions. Identifying weaknesses, drop-off points, and missing psychological triggers.

You MUST return a valid JSON object only. The JSON must follow this exact structure:
{
  "score": 0, // Integer 0-100 indicating conversion probability
  "whatsWorking": "What works well in 2 sentences",
  "criticalDropoffs": "What is broken and where viewers will lose interest in 2 sentences",
  "rewrittenScript": "Provide a fully rewritten script broken into scenes, using HTML tags like <p><strong>[0:00 - 0:03] Hook</strong><br>Voiceover: ...</p>"
}`;

        try {
            const apiResult = await callClaudeAPI(systemPrompt);
            clearInterval(intv);
            if(msgEl) msgEl.innerText = msgs[0]; // reset
            renderTesterOutputUI(apiResult);
            navigateTo('view-tester-output');
        } catch (error) {
            clearInterval(intv);
            if(msgEl) msgEl.innerText = msgs[0]; // reset
            alert("Something went wrong testing your script. Please try again.\n" + error.message);
        }
    }

    function renderTesterOutputUI(json) {
        if (!json || typeof json.score === 'undefined') return;
        const out = document.getElementById('view-tester-output');
        if(!out) return;
        
        out.innerHTML = `
            <div class="subheader scroll-sticky">
                <button class="back-btn interactive-hitbox" data-navigate="view-home"><ion-icon name="arrow-back"></ion-icon> Dashboard</button>
                <div style="flex:1; text-align:center;">
                    <h2 style="color: ${json.score > 75 ? '#10B981' : json.score > 50 ? '#F59E0B' : '#EF4444'}; font-size: 2.2rem; margin:0;">${json.score}/100</h2>
                    <span class="subtitle" style="margin:0;">Conversion Score</span>
                </div>
            </div>
            <div class="form-container" style="padding-top: 10px;">
                <div class="feed-card mb-2" style="border-left: 4px solid #10B981;">
                    <h3 style="margin-bottom: 8px;">What's working</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary);">${json.whatsWorking}</p>
                </div>
                <div class="feed-card mb-2" style="border-left: 4px solid #EF4444;">
                    <h3 style="margin-bottom: 8px;">Critical Drop-offs</h3>
                    <p style="font-size: 0.9rem; color: var(--text-secondary);">${json.criticalDropoffs}</p>
                </div>
                <h3 class="mt-2 mb-2">AI Rewritten Script (Optimised)</h3>
                <div class="feed-card markdown-body" style="background: rgba(99, 102, 241, 0.05); border-color: var(--border-focus);">
                    ${json.rewrittenScript}
                </div>
                <button class="btn-primary mt-action interactive-hitbox" data-navigate="view-tester" style="margin-bottom: 40px;">
                    <ion-icon name="refresh-outline"></ion-icon> Test Another Script
                </button>
            </div>
        `;
    }

    // Reusable API Runner
    async function runStrategyGeneration(source) {
        navigateTo('view-loading');
        const msgs = ["Analysing your inputs...", "Building your hook strategy...", "Crafting your script...", "Finalising execution plan..."];
        let count = 0;
        const msgEl = document.getElementById('loading-msg');
        
        let intv = setInterval(() => {
            count++;
            if(count < msgs.length && msgEl) msgEl.innerText = msgs[count];
        }, 800);

        // Gather Inputs
        let payload = {};
        if (source === 'quick') {
            payload = {
                product: document.getElementById('q-product')?.value || '',
                goal: document.getElementById('q-goal')?.value || '',
                videoType: document.querySelector('#q-video-type .chip.active')?.innerText.trim() || '',
                platforms: Array.from(document.querySelectorAll('#q-platforms .chip.active')).map(c => c.innerText).join(', ') || Array.from(document.querySelectorAll('#view-quick .choice-chips:not(.single-select):not(.brand-tones) .chip.active')).map(c => c.innerText).join(', '),
                url: document.getElementById('q-url')?.value || '',
                audience: document.getElementById('q-brand-audience')?.value || '',
                message: document.getElementById('q-brand-message')?.value || '',
                benefits: Array.from(document.querySelectorAll('#q-benefits-group .benefit-input')).map(i => i.value).join(', '),
                pain: document.getElementById('q-brand-pain')?.value || '',
                usp: document.getElementById('q-brand-usp')?.value || '',
                tone: Array.from(document.querySelectorAll('.brand-tones .chip.active')).map(c => c.innerText).join(', '),
                competitor: document.getElementById('q-brand-competitor')?.value || '',
                objections: document.getElementById('q-brand-objections')?.value || ''
            };
        } else if (source === 'wiz') {
            payload = {
                product: document.getElementById('w-product')?.value || '',
                goal: document.getElementById('w-goal')?.value || '',
                videoType: document.querySelector('#w-video-type .chip.active')?.innerText.trim() || '',
                platforms: Array.from(document.querySelectorAll('#w-platforms .chip.active')).map(c => c.innerText).join(', ') || Array.from(document.querySelectorAll('#view-wizard .choice-chips:not(.single-select):not(.brand-tones) .chip.active')).map(c => c.innerText).join(', '),
                url: '',
                audience: document.getElementById('w-target-audience')?.value || '',
                message: document.getElementById('w-brand-message')?.value || '',
                benefits: Array.from(document.querySelectorAll('#w-benefits-group .benefit-input')).map(i => i.value).join(', '),
                pain: document.getElementById('w-brand-pain')?.value || '',
                usp: document.getElementById('w-brand-usp')?.value || '',
                tone: Array.from(document.querySelectorAll('#view-wizard .brand-tones .chip.active')).map(c => c.innerText).join(', '),
                competitor: document.getElementById('w-brand-competitor')?.value || '',
                objections: document.getElementById('w-brand-objections')?.value || ''
            };
        }

        const systemPrompt = `You are a world-class video marketing strategist, creative director, and scriptwriter. You specialise in high-converting video ads, UGC content, motion graphics, and social media video strategy.

You are generating a completely unique, tailor-made video strategy for this specific brand. Never produce generic output. Every word must reflect the brand's voice, audience, pain points, and goals.

The entire strategy, script, scene breakdown, visual direction, and hook variations must be specifically crafted for a ${payload.videoType || 'video'} format. The pacing, tone, structure, camera direction, and editing style must all match what works best for this video type. Never produce a generic script — every output must feel native to the selected video format.

Here is everything you know about this brand:
- Product/Service: ${payload.product || 'N/A'}
- Target Audience: ${payload.audience || 'N/A'}
- Primary Goal: ${payload.goal || 'N/A'}
- Video Type: ${payload.videoType || 'N/A'}
- Target Platform: ${payload.platforms || 'N/A'}
- Key Message: ${payload.message || 'N/A'}
- Core Benefits: ${payload.benefits || 'N/A'}
- Main Pain Point: ${payload.pain || 'N/A'}
- Unique Selling Point: ${payload.usp || 'N/A'}
- Brand Tone: ${payload.tone || 'N/A'}
- Competitor Reference: ${payload.competitor || 'N/A'}
- Customer Objections: ${payload.objections || 'N/A'}
- Website Intelligence: ${payload.url ? 'User URL Provided: ' + payload.url : 'None'}

Using ALL of this context, generate a powerful, specific, conversion-focused video strategy.

You MUST return a valid JSON object only — no markdown, no explanation, no extra text before or after. The JSON must follow this exact structure:
{
  "strategyOverview": {
    "frameworkName": "",
    "contentAngle": "",
    "whyItWorks": "",
    "recommendedLength": "",
    "pacingStyle": ""
  },
  "hookVariations": [
    { "hook": "", "type": "", "whyItWorks": "" }
  ],
  "fullScript": {
    "scenes": [
      { "sceneNumber": 1, "label": "", "voiceover": "", "onScreenText": "", "motionCue": "", "duration": "" }
    ]
  },
  "visualDirection": {
    "animationStyle": "",
    "colorMood": "",
    "transitionStyle": "",
    "typographyDirection": "",
    "assetSuggestions": ""
  },
  "variationsForTesting": [
    { "angle": "", "hook": "", "summary": "" }
  ]
}`;

        try {
            const apiResult = await callClaudeAPI(systemPrompt);
            clearInterval(intv);
            if(msgEl) msgEl.innerText = msgs[0]; // reset
            renderOutputUI(apiResult, payload);
            navigateTo('view-output');
        } catch (error) {
            clearInterval(intv);
            if(msgEl) msgEl.innerText = msgs[0]; // reset
            alert("Something went wrong generating your strategy. Please try again.\n" + error.message);
        }
    }

    // ==========================================
    // Claude API Orchestration
    // ==========================================
    
    async function callClaudeAPI(dynamicSystemPrompt) {
        console.log("Calling Claude API via Vercel proxy...");

        const response = await fetch("/api/claude", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 4000,
                system: dynamicSystemPrompt,
                messages: [
                    { "role": "user", "content": "Please generate the JSON response according to the strict JSON instructions provided in the system prompt." }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || err.error || "API Request Failed");
        }

        const data = await response.json();
        const textContent = data.content[0].text;
        
        try {
            let cleanJSON = textContent;
            if(textContent.includes("\`\`\`json")) {
                cleanJSON = textContent.split("\`\`\`json")[1].split("\`\`\`")[0];
            } else if (textContent.includes("\`\`\`")) {
                cleanJSON = textContent.split("\`\`\`")[1].split("\`\`\`")[0];
            }
            return JSON.parse(cleanJSON.trim());
        } catch(e) {
            console.error("Failed to parse JSON", textContent);
            throw new Error("Invalid output format from AI. Could not parse JSON.");
        }
    }

    function renderOutputUI(jsonResponse, payload) {
        // Safe check
        if (!jsonResponse || !jsonResponse.strategyOverview) return;
        
        // 1. Strategy Overview
        const so = jsonResponse.strategyOverview;
        document.getElementById('out-strategy-content').innerHTML = `
            <h3>Chosen Framework: ${so.frameworkName}</h3>
            <p><strong>Angle:</strong> ${so.contentAngle}</p>
            <p><strong>Why it works:</strong> ${so.whyItWorks}</p>
            <p><strong>Proposed Pacing:</strong> ${so.pacingStyle} | Length: ${so.recommendedLength}</p>
        `;
        
        // 2. Hooks
        let hooksHTML = '';
        (jsonResponse.hookVariations || []).forEach(h => {
            hooksHTML += `<div class="feed-card mb-2">
                <span class="chip" style="font-size:0.7rem; padding: 4px 8px; margin-bottom: 8px; display:inline-block;">${h.type || 'Hook'}</span>
                <h4>"${h.hook}"</h4>
                <p style="font-size: 0.85rem; margin-top:8px; color: var(--text-tertiary)">${h.whyItWorks || ''}</p>
            </div>`;
        });
        document.getElementById('out-hooks-content').innerHTML = hooksHTML;
        
        // 3. Full Script
        let scriptHTML = '';
        (jsonResponse.fullScript?.scenes || []).forEach(s => {
            scriptHTML += `<div class="feed-card mb-2">
                <strong>[${s.duration || 'Scene ' + s.sceneNumber}] ${s.label || ''}</strong><br>
                <div style="font-size:0.85rem; color:var(--text-secondary); margin-top: 4px;">
                    <p>🎥 <span style="color:var(--text-primary)">${s.motionCue || ''}</span></p>
                    <p>🗣 <span style="color:var(--text-primary)">"${s.voiceover || ''}"</span></p>
                    <p>💬 <span style="color:var(--text-primary)">${s.onScreenText || ''}</span></p>
                </div>
            </div>`;
        });
        document.getElementById('out-script-content').innerHTML = scriptHTML;
        
        // 4. Visual Direction
        const vd = jsonResponse.visualDirection;
        if(vd) {
            document.getElementById('out-visual-content').innerHTML = `
                <h3>UI/Motion Animation Notes</h3>
                <ul>
                    <li><strong>Style:</strong> ${vd.animationStyle}</li>
                    <li><strong>Mood:</strong> ${vd.colorMood}</li>
                    <li><strong>Typography:</strong> ${vd.typographyDirection}</li>
                    <li><strong>Transitions:</strong> ${vd.transitionStyle}</li>
                    <li><strong>Assets:</strong> ${vd.assetSuggestions}</li>
                </ul>
            `;
        }
        
        // 5. Variations
        let varsHTML = '';
        (jsonResponse.variationsForTesting || []).forEach(v => {
            varsHTML += `<div class="feed-card mb-2">
                <h4>Angle: ${v.angle}</h4>
                <p style="margin-bottom:8px;"><em>"${v.hook}"</em></p>
                <p style="font-size: 0.85rem;">${v.summary}</p>
            </div>`;
        });
        document.getElementById('out-vars-content').innerHTML = varsHTML;
        
        // Save current project in memory for saving
        window.currentGeneratedProject = {
            id: Date.now().toString(),
            projectName: payload.product || 'New Strategy',
            productService: payload.product || '',
            primaryGoal: payload.goal || '',
            targetPlatform: payload.platforms || '',
            dateCreated: new Date().toISOString(),
            fullOutput: jsonResponse
        };
        
        // Inject Save Button into Output Actions if not exists
        const actionsContainer = document.querySelector('.output-actions');
        if (actionsContainer && !document.getElementById('btn-save-project')) {
            actionsContainer.innerHTML += `
                <button class="btn-primary" id="btn-save-project" style="margin-top: 10px; background: linear-gradient(135deg, #10B981, #059669);">
                    <ion-icon name="save-outline"></ion-icon> Save Project
                </button>
            `;
            document.getElementById('btn-save-project').addEventListener('click', saveCurrentProject);
        }
    }

    // ==========================================
    // Population Mocks (Dummies for empty views)
    // ==========================================
    function initDummies() {
        // Templates List
        document.getElementById('templates-container').innerHTML = `
            <div class="feed-card mb-2">
                <h3>Problem → Agitate → Solution</h3>
                <p>The gold standard for direct response. Hooks the viewer by calling out their exact pain.</p>
                <div style="margin-top:12px"><span class="chip">Conversion</span> <span class="chip">Cross-platform</span></div>
            </div>
            <div class="feed-card mb-2">
                <h3>Curiosity Gap Hook</h3>
                <p>Highly effective for TikTok and Reels. Creates a knowledge gap that forces retention.</p>
            </div>
            <div class="feed-card mb-2">
                <h3>Testimonial Avalanche</h3>
                <p>Social proof packed into the first 5 seconds to build immediate trust.</p>
            </div>
        `;
    }


    // ==========================================
    // Project Saving / LocalStorage System
    // ==========================================
    
    function getProjects() {
        return JSON.parse(localStorage.getItem('strategist_projects') || '[]');
    }
    
    function saveProjects(projects) {
        localStorage.setItem('strategist_projects', JSON.stringify(projects));
        renderProjectsList(); // Refresh lists whenever saved
    }

    function saveCurrentProject() {
        if (!window.currentGeneratedProject) return;
        const pName = prompt("Name this project:", window.currentGeneratedProject.projectName);
        if (pName !== null) {
            window.currentGeneratedProject.projectName = pName || 'Untitled Strategy';
            const projects = getProjects();
            projects.push(window.currentGeneratedProject);
            saveProjects(projects);
            alert("Project saved successfully!");
            document.getElementById('btn-save-project').style.display = 'none'; // hide to prevent gross dupes
        }
    }

    window.openProject = function(id) {
        const p = getProjects().find(x => x.id === id);
        if(p && p.fullOutput) {
            renderOutputUI(p.fullOutput, p);
            document.getElementById('btn-save-project')?.remove(); // Disable save for existing projects
            navigateTo('view-output');
        }
    }

    window.deleteProject = function(id) {
        if(confirm("Delete this project?")) {
            let projects = getProjects();
            projects = projects.filter(x => x.id !== id);
            saveProjects(projects);
        }
    }

    window.duplicateProject = function(id) {
        const projects = getProjects();
        const p = projects.find(x => x.id === id);
        if(p) {
            const clone = JSON.parse(JSON.stringify(p));
            clone.id = Date.now().toString();
            clone.projectName = "Copy of " + clone.projectName;
            clone.dateCreated = new Date().toISOString();
            projects.push(clone);
            saveProjects(projects);
        }
    }

    window.exportProject = function(id) {
        const p = getProjects().find(x => x.id === id);
        if(p) {
            const txt = `PROJECT: ${p.projectName}\nGOAL: ${p.primaryGoal}\nURL: ${p.fullOutput.strategyOverview?.frameworkName}\n...\nData stored efficiently!`;
            if (navigator.share) {
                navigator.share({ title: p.projectName, text: txt });
            } else {
                navigator.clipboard.writeText(JSON.stringify(p.fullOutput, null, 2));
                alert("Copied raw project strategy to clipboard!");
            }
        }
    }

    function renderProjectsList() {
        const projects = getProjects();
        
        // Render in Home (bottom) [Last 2 only]
        const homeContainer = document.getElementById('home-recent-projects');
        if (homeContainer) {
            if (projects.length === 0) {
                homeContainer.innerHTML = '';
            } else {
                let html = '<div class="section-title mb-2"><h3>Recent Projects</h3><button class="text-btn interactive-hitbox" data-navigate="view-projects">View all &rarr;</button></div>';
                projects.slice(-2).reverse().forEach(p => {
                    const dateStr = new Date(p.dateCreated).toLocaleDateString();
                    html += `<div class="card premium-card horizontal-card interactive-hitbox mb-2" onclick="openProject('${p.id}')">
                        <div style="flex:1"><h4>${p.projectName}</h4><p style="font-size: 0.8rem;">${p.primaryGoal} • ${p.targetPlatform} • ${dateStr}</p></div>
                        <ion-icon name="chevron-forward" style="color: var(--text-tertiary);"></ion-icon>
                    </div>`;
                });
                homeContainer.innerHTML = html;
            }
        }
        
        // Render in view-projects
        const listContainer = document.getElementById('project-list-wrapper');
        if(listContainer) {
             if (projects.length === 0) {
                 listContainer.innerHTML = `
                    <div class="empty-state">
                        <ion-icon name="folder-open-outline" class="empty-icon"></ion-icon>
                        <p style="margin-bottom: 24px;">You haven't saved any projects yet.</p>
                        <button class="btn-primary" onclick="document.querySelector('[data-navigate=view-home]').click()">Create New Strategy</button>
                    </div>
                 `;
             } else {
                 let html = '';
                 projects.slice().reverse().forEach(p => {
                     const dateStr = new Date(p.dateCreated).toLocaleDateString();
                     html += `
                     <div class="feed-card mb-2">
                        <div style="display:flex; justify-content:space-between; align-items: flex-start;">
                            <div>
                                <h4 style="color: var(--text-primary); margin-bottom: 4px;">${p.projectName}</h4>
                                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">${p.primaryGoal} • ${p.targetPlatform} • ${dateStr}</p>
                            </div>
                            <button class="icon-btn interactive-hitbox" style="color: #EF4444;" onclick="deleteProject('${p.id}')"><ion-icon name="trash"></ion-icon></button>
                        </div>
                        <div style="display:flex; gap: 8px;">
                             <button class="btn-ghost" style="flex:1.5; padding: 10px;" onclick="openProject('${p.id}')">Open</button>
                             <button class="btn-ghost" style="flex:1; padding: 10px;" onclick="duplicateProject('${p.id}')"><ion-icon name="copy-outline"></ion-icon> Copy</button>
                             <button class="btn-ghost" style="flex:1; padding: 10px;" onclick="exportProject('${p.id}')"><ion-icon name="share-social-outline"></ion-icon> Share</button>
                        </div>
                    </div>`;
                 });
                 listContainer.innerHTML = html;
             }
        }
    }

    renderProjectsList(); // Init pull


    initDummies();
});
