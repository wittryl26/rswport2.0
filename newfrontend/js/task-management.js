/**
 * Task Management System
 * Interactive component that affects the bottleneck predictor
 */

class TaskManager {
  constructor(options = {}) {
    console.log("TaskManager constructor called with options:", options);
    this.containerId = options.containerId;
    this.onDataChange = options.onDataChange || (() => {});
    this.tasks = [];
    this.users = ["you", "john", "sarah", "alex", "maria"];
    this.projects = [
      "Cloud Migration", 
      "CRM Implementation", 
      "Mobile App Development"
    ];
    this.phases = {
      "Cloud Migration": ["Planning", "Development", "Testing", "Deployment"],
      "CRM Implementation": ["Requirements", "Configuration", "Data Migration", "Training"],
      "Mobile App Development": ["Design", "Development", "QA Testing", "App Store Approval"]
    };
    this.currentData = null;
  }

  initialize(bottleneckData) {
    console.log("TaskManager initializing with data:", bottleneckData);
    
    // Store reference to original data
    this.currentData = JSON.parse(JSON.stringify(bottleneckData));
    
    // Generate tasks based on bottleneck data
    this.generateTasks();
    
    // Render task UI
    this.render();
    
    // Set up event listeners
    this.setupEventListeners();
    
    return this;
  }
  
  generateTasks() {
    this.tasks = [];
    let taskId = 1;
    
    // Create tasks for each project phase
    this.currentData.projects.forEach(project => {
      project.phases.forEach(phase => {
        // Generate 1-3 tasks for this phase
        const taskCount = 1 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < taskCount; i++) {
          const daysToAdd = Math.floor(Math.random() * 14) + 1; // 1-14 days
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + daysToAdd);
          
          const task = {
            id: taskId++,
            title: this.getTaskTitle(project.name, phase.name, i),
            project: project.name,
            phase: phase.name,
            assignedTo: this.getRandomUser(),
            status: this.getTaskStatus(),
            risk: phase.risk,
            dueDate: dueDate.toISOString().split('T')[0],
            bottleneckImpact: this.getBottleneckImpact(phase.bottleneckRisk)
          };
          
          this.tasks.push(task);
        }
      });
    });
    
    // Sort tasks by due date
    this.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    console.log(`Generated ${this.tasks.length} tasks`);
  }
  
  getTaskTitle(project, phase, index) {
    const taskTitles = {
      Planning: ["Create project plan", "Define project scope", "Schedule resources", "Identify stakeholders", "Set up kickoff meeting"],
      Development: ["Implement core features", "Build backend API", "Create frontend components", "Set up database", "Configure environment"],
      Testing: ["Prepare test cases", "Execute test cases", "Fix reported bugs", "Regression testing", "Performance testing"],
      Deployment: ["Prepare deployment plan", "Create backup strategy", "Configure production environment", "Deploy solution", "Post-deployment verification"],
      Requirements: ["Gather business requirements", "Document use cases", "Create functional specs", "User interviews", "Requirements validation"],
      Configuration: ["System configuration", "User role setup", "Workflow configuration", "Integration setup", "Data mapping"],
      "Data Migration": ["Create data migration plan", "Data cleansing", "Test data migration", "Validate migrated data", "Schema mapping"],
      Training: ["Develop training materials", "Schedule training sessions", "Conduct user training", "Create user documentation", "Collect feedback"],
      Design: ["Create wireframes", "Design UI mockups", "Review design with stakeholders", "Finalize design", "Create style guide"],
      "QA Testing": ["Create test cases", "Execute test cases", "Report bugs", "Verify bug fixes", "Acceptance testing"],
      "App Store Approval": ["Prepare submission assets", "Review app guidelines", "Submit for review", "Address reviewer feedback", "Prepare for launch"]
    };
    
    const titles = taskTitles[phase] || ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"];
    return titles[index % titles.length];
  }
  
  getRandomUser() {
    return this.users[Math.floor(Math.random() * this.users.length)];
  }
  
  getTaskStatus() {
    const statuses = ["Not Started", "In Progress", "Blocked", "Completed"];
    const weights = [0.2, 0.4, 0.1, 0.3]; // 20% not started, 40% in progress, 10% blocked, 30% completed
    
    let random = Math.random();
    let weightSum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      weightSum += weights[i];
      if (random < weightSum) {
        return statuses[i];
      }
    }
    
    return statuses[0];
  }
  
  getBottleneckImpact(riskLevel) {
    switch (riskLevel) {
      case "Critical": return "High";
      case "High": return "Medium";
      case "Medium": return "Low";
      case "Low": return "Minimal";
      default: return "Low";
    }
  }
  
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Task manager container not found: ${this.containerId}`);
      return;
    }
    
    console.log(`Rendering task manager UI in container: ${this.containerId}`);
    
    // Create task management UI
    container.innerHTML = `
      <div class="task-manager">
        <div class="task-header">
          <h4>Project Tasks</h4>
          <div class="task-filters">
            <select id="filter-project">
              <option value="">All Projects</option>
              ${this.projects.map(project => `<option value="${project}">${project}</option>`).join('')}
            </select>
            <select id="filter-assigned">
              <option value="">All Users</option>
              ${this.users.map(user => `<option value="${user}">${user === "you" ? "You" : user}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="task-list">
          ${this.renderTasks()}
        </div>
        <div class="task-info">
          <p><small>Update task status to see how it affects the bottleneck predictor in real-time.</small></p>
        </div>
      </div>
    `;
  }
  
  renderTasks() {
    if (this.tasks.length === 0) {
      return '<div class="no-tasks">No tasks available</div>';
    }
    
    return this.tasks.map(task => `
      <div class="task-item ${task.assignedTo === 'you' ? 'assigned-to-you' : ''}" data-task-id="${task.id}">
        <div class="task-status-indicator ${this.getStatusClass(task.status)}"></div>
        <div class="task-details">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <span class="task-project">${task.project} | ${task.phase}</span>
            <span class="task-due-date ${this.isOverdue(task.dueDate) ? 'overdue' : ''}" title="Due date">
              <i class="fas fa-calendar-alt"></i> ${task.dueDate}
            </span>
          </div>
          <div class="task-assignment">
            <span class="assigned-to">
              <i class="fas fa-user"></i> ${task.assignedTo === 'you' ? 'You' : task.assignedTo}
            </span>
            <span class="bottleneck-impact ${task.bottleneckImpact.toLowerCase()}">
              ${task.bottleneckImpact} Impact
            </span>
          </div>
        </div>
        <div class="task-actions">
          <select class="task-status-select" data-task-id="${task.id}">
            <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Blocked" ${task.status === 'Blocked' ? 'selected' : ''}>Blocked</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      </div>
    `).join('');
  }
  
  getStatusClass(status) {
    switch (status) {
      case "Not Started": return "not-started";
      case "In Progress": return "in-progress";
      case "Blocked": return "blocked";
      case "Completed": return "completed";
      default: return "";
    }
  }
  
  isOverdue(dueDate) {
    return new Date(dueDate) < new Date();
  }
  
  setupEventListeners() {
    console.log("Setting up task event listeners");
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    // Task status change
    container.querySelectorAll('.task-status-select').forEach(select => {
      select.addEventListener('change', (event) => {
        const taskId = parseInt(event.target.dataset.taskId);
        const newStatus = event.target.value;
        console.log(`Task ${taskId} status changed to ${newStatus}`);
        this.updateTaskStatus(taskId, newStatus);
      });
    });
    
    // Project filter change
    const projectFilter = container.querySelector('#filter-project');
    if (projectFilter) {
      projectFilter.addEventListener('change', () => {
        this.applyFilters();
      });
    }
    
    // Assigned filter change
    const assignedFilter = container.querySelector('#filter-assigned');
    if (assignedFilter) {
      assignedFilter.addEventListener('change', () => {
        this.applyFilters();
      });
    }
  }
  
  applyFilters() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    const projectFilter = container.querySelector('#filter-project').value;
    const assignedFilter = container.querySelector('#filter-assigned').value;
    
    container.querySelectorAll('.task-item').forEach(taskItem => {
      const taskId = parseInt(taskItem.dataset.taskId);
      const task = this.tasks.find(t => t.id === taskId);
      
      if (!task) return;
      
      let isVisible = true;
      
      if (projectFilter && task.project !== projectFilter) {
        isVisible = false;
      }
      
      if (assignedFilter && task.assignedTo !== assignedFilter) {
        isVisible = false;
      }
      
      taskItem.style.display = isVisible ? '' : 'none';
    });
  }
  
  updateTaskStatus(taskId, newStatus) {
    // Find the task
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    // Update task status
    this.tasks[taskIndex].status = newStatus;
    
    // Update the data model
    this.updateBottleneckData();
    
    // Notify of data change
    if (this.onDataChange) {
      this.onDataChange(this.currentData);
    }
    
    // Show a visual indicator of the change
    this.showUpdateIndicator(taskId);
  }
  
  showUpdateIndicator(taskId) {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    const taskItem = container.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (taskItem) {
      taskItem.classList.add('updated');
      setTimeout(() => {
        taskItem.classList.remove('updated');
      }, 1000);
    }
  }
  
  updateBottleneckData() {
    // Reset risk calculations
    this.currentData.projects.forEach(project => {
      project.phases.forEach(phase => {
        phase.originalRisk = phase.originalRisk || phase.risk; // Store original risk first time
      });
    });
    
    // Calculate new risk values based on task status
    this.tasks.forEach(task => {
      const project = this.currentData.projects.find(p => p.name === task.project);
      if (!project) return;
      
      const phase = project.phases.find(p => p.name === task.phase);
      if (!phase) return;
      
      // Adjust risk based on task status
      let taskRiskFactor = 0;
      
      switch (task.status) {
        case "Not Started":
          taskRiskFactor = 0.2; // Slightly increases risk
          break;
        case "In Progress":
          taskRiskFactor = 0; // Neutral
          break;
        case "Blocked":
          taskRiskFactor = 0.3; // Significantly increases risk
          break;
        case "Completed":
          taskRiskFactor = -0.2; // Decreases risk
          break;
      }
      
      // Apply task risk factor, weighted by bottleneck impact
      let impactWeight = 0.1; // Minimal
      
      switch (task.bottleneckImpact) {
        case "High": impactWeight = 0.4; break;
        case "Medium": impactWeight = 0.25; break;
        case "Low": impactWeight = 0.15; break;
      }
      
      // Phase risk update (clamped between 0.1 and 0.95)
      phase.risk = Math.min(0.95, Math.max(0.1, phase.originalRisk + (taskRiskFactor * impactWeight)));
      
      // Update bottleneck risk category based on new risk value
      if (phase.risk <= 0.3) phase.bottleneckRisk = "Low";
      else if (phase.risk <= 0.6) phase.bottleneckRisk = "Medium";
      else if (phase.risk <= 0.8) phase.bottleneckRisk = "High";
      else phase.bottleneckRisk = "Critical";
    });
    
    // Update resource allocation based on task status
    const resourceMap = {
      "Developer": ["Frontend Developers", "Backend Developers"],
      "Tester": ["QA Engineers"],
      "DevOps": ["DevOps"],
      "Manager": ["Project Managers"]
    };
    
    // Count tasks by status for each role
    const tasksByRole = {
      "Developer": { total: 0, completed: 0 },
      "Tester": { total: 0, completed: 0 },
      "DevOps": { total: 0, completed: 0 },
      "Manager": { total: 0, completed: 0 }
    };
    
    this.tasks.forEach(task => {
      // Determine role based on phase
      let role = "Developer"; // Default
      
      if (task.phase.includes("Test") || task.phase.includes("QA")) {
        role = "Tester";
      } else if (task.phase === "Deployment" || task.phase === "Planning") {
        role = "DevOps";
      } else if (task.phase === "Requirements" || task.phase === "Training") {
        role = "Manager";
      }
      
      // Count task
      tasksByRole[role].total++;
      if (task.status === "Completed") {
        tasksByRole[role].completed++;
      }
    });
    
    // Update resource allocations based on task completion
    this.currentData.resources.forEach(resource => {
      // Find which role this resource belongs to
      let matchingRole = null;
      
      for (const [role, resources] of Object.entries(resourceMap)) {
        if (resources.includes(resource.name)) {
          matchingRole = role;
          break;
        }
      }
      
      if (matchingRole) {
        const roleStats = tasksByRole[matchingRole];
        if (roleStats.total > 0) {
          // Calculate allocation based on incomplete tasks
          const incompleteTasks = roleStats.total - roleStats.completed;
          const baseAllocation = 0.5; // Base allocation
          const taskFactor = incompleteTasks / roleStats.total;
          
          // Adjust allocation (between 0.4 and 0.95)
          resource.allocation = Math.min(0.95, Math.max(0.4, baseAllocation + (taskFactor * 0.5)));
          
          // Update bottleneck risk based on allocation
          if (resource.allocation <= 0.6) resource.bottleneckRisk = "Low";
          else if (resource.allocation <= 0.75) resource.bottleneckRisk = "Medium";
          else if (resource.allocation <= 0.85) resource.bottleneckRisk = "High";
          else resource.bottleneckRisk = "Critical";
        }
      }
    });
    
    console.log("Bottleneck data updated based on task changes");
  }
}

// Make the TaskManager available globally
window.TaskManager = TaskManager;

console.log("TaskManager class defined");
