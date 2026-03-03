/**
 * GitHub Issue Agent
 *
 * Interactive CLI that fetches GitHub issues and uses Claude to resolve them.
 * Usage:
 *   npm run agent:github            — browse open issues interactively
 *   npm run agent:github -- 42      — jump straight to issue #42
 *
 * Requirements:
 *   - ANTHROPIC_API_KEY env variable set
 *   - gh CLI installed and authenticated (https://cli.github.com)
 */

import { query } from '@anthropic-ai/claude-agent-sdk'
import { execSync } from 'node:child_process'
import * as readline from 'node:readline'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Issue {
  number: number
  title: string
  body: string
  labels: Array<{ name: string }>
  state: string
}

interface IssueDetails extends Issue {
  comments: Array<{
    author: { login: string }
    body: string
    createdAt: string
  }>
}

// ─── GitHub helpers ───────────────────────────────────────────────────────────

function getRepo(): string {
  try {
    return execSync('gh repo view --json nameWithOwner -q .nameWithOwner', {
      encoding: 'utf8',
    }).trim()
  } catch {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
    const match = remote.match(/github\.com[:/](.+?)(?:\.git)?$/)
    if (!match) throw new Error('Could not parse GitHub repository from git remote.')
    return match[1]
  }
}

function listOpenIssues(repo: string): Issue[] {
  const out = execSync(
    `gh issue list --repo ${repo} --json number,title,body,labels,state --limit 30 --state open`,
    { encoding: 'utf8' },
  )
  return JSON.parse(out)
}

function fetchIssue(repo: string, number: number): IssueDetails {
  const out = execSync(
    `gh issue view ${number} --repo ${repo} --json number,title,body,comments,labels,state`,
    { encoding: 'utf8' },
  )
  return JSON.parse(out)
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(issue: IssueDetails, repo: string): string {
  const labels = issue.labels.map((l) => l.name).join(', ') || 'none'
  const comments =
    issue.comments.length > 0
      ? issue.comments
          .map((c) => `**${c.author.login}** (${c.createdAt.slice(0, 10)}):\n${c.body}`)
          .join('\n\n---\n\n')
      : '_No comments._'

  return `You are resolving GitHub issue #${issue.number} from the repository **${repo}**.

## Issue Details
**Title:** ${issue.title}
**Labels:** ${labels}

**Description:**
${issue.body?.trim() || '_No description provided._'}

## Comments
${comments}

## Your Task
1. Read and understand what the issue is asking for.
2. Explore the codebase to find the relevant files (use Glob, Grep, and Read tools).
3. Implement the fix or feature described in the issue.
4. Only change what is necessary to resolve the issue — avoid unrelated refactors.
5. When done, write a short summary of what you changed and why.

Begin by exploring the relevant parts of the codebase.`
}

// ─── Interactive helpers ──────────────────────────────────────────────────────

function ask(prompt: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

function printHeader() {
  console.log()
  console.log('╔══════════════════════════════════╗')
  console.log('║       GitHub Issue Agent         ║')
  console.log('╚══════════════════════════════════╝')
  console.log()
}

function printIssueList(issues: Issue[]) {
  if (issues.length === 0) {
    console.log('  No open issues found.\n')
    return
  }
  for (const [i, issue] of issues.entries()) {
    const label =
      issue.labels.length > 0 ? `  [${issue.labels.map((l) => l.name).join(', ')}]` : ''
    const idx = String(i + 1).padStart(3)
    console.log(`${idx}.  #${issue.number}  ${issue.title}${label}`)
  }
  console.log()
}

function printIssueSummary(issue: IssueDetails) {
  const divider = '─'.repeat(50)
  console.log()
  console.log(divider)
  console.log(`Issue #${issue.number}: ${issue.title}`)
  if (issue.labels.length > 0) {
    console.log(`Labels : ${issue.labels.map((l) => l.name).join(', ')}`)
  }
  console.log(divider)
  if (issue.body) {
    const preview = issue.body.length > 400 ? issue.body.slice(0, 400) + ' …' : issue.body
    console.log(preview.trim())
  }
  if (issue.comments.length > 0) {
    console.log(`\n(+${issue.comments.length} comment${issue.comments.length > 1 ? 's' : ''})`)
  }
  console.log(divider)
  console.log()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  printHeader()

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set.')
    process.exit(1)
  }

  // Resolve repository
  let repo: string
  try {
    repo = getRepo()
    console.log(`Repository: ${repo}\n`)
  } catch (err) {
    console.error('Error: Could not determine GitHub repository.')
    console.error('Make sure the gh CLI is installed (https://cli.github.com) and authenticated.')
    process.exit(1)
  }

  // Resolve issue number — from CLI arg or interactive selection
  let issueNumber: number
  const cliArg = process.argv[2]

  if (cliArg && /^\d+$/.test(cliArg)) {
    issueNumber = parseInt(cliArg, 10)
  } else {
    console.log('Fetching open issues…')
    let issues: Issue[]
    try {
      issues = listOpenIssues(repo)
    } catch (err) {
      console.error('Error fetching issues:', err instanceof Error ? err.message : err)
      process.exit(1)
    }

    printIssueList(issues)

    if (issues.length === 0) process.exit(0)

    const answer = await ask('Enter issue number to resolve (or q to quit): #')
    if (!answer || answer.toLowerCase() === 'q') {
      console.log('Goodbye.')
      process.exit(0)
    }

    issueNumber = parseInt(answer, 10)
    if (isNaN(issueNumber)) {
      console.error('Invalid input — expected a number.')
      process.exit(1)
    }
  }

  // Fetch full issue details
  console.log(`\nFetching issue #${issueNumber}…`)
  let issue: IssueDetails
  try {
    issue = fetchIssue(repo, issueNumber)
  } catch {
    console.error(`Error: Could not fetch issue #${issueNumber}. Check the number and try again.`)
    process.exit(1)
  }

  printIssueSummary(issue)

  const confirm = await ask('Start resolving this issue? (y/n): ')
  if (confirm.toLowerCase() !== 'y') {
    console.log('Aborted.')
    process.exit(0)
  }

  console.log('\nStarting Claude agent…')
  console.log('(Claude will ask for permission before editing files)\n')

  const prompt = buildPrompt(issue, repo)

  for await (const message of query({
    prompt,
    options: {
      cwd: process.cwd(),
      allowedTools: ['Read', 'Edit', 'Write', 'Bash', 'Glob', 'Grep'],
      permissionMode: 'default',
      model: 'claude-opus-4-6',
    },
  })) {
    if ('result' in message) {
      const divider = '─'.repeat(50)
      console.log(`\n${divider}`)
      console.log('Agent summary:')
      console.log(divider)
      console.log(message.result)
      console.log(divider)
    }
  }

  console.log('\nDone! Run `git diff` to review changes before committing.')
}

main().catch((err) => {
  console.error('\nFatal error:', err instanceof Error ? err.message : err)
  process.exit(1)
})
