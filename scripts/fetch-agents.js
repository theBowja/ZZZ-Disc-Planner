import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const imagesDir = path.join(rootDir, 'public', 'images', 'agents')
const dataFile = path.join(rootDir, 'public', 'agents-data.json')

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file)
          file.on('finish', () => {
            file.close()
            resolve()
          })
        } else if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          file.close()
          fs.unlinkSync(filepath)
          downloadFile(response.headers.location, filepath).then(resolve).catch(reject)
        } else {
          file.close()
          fs.unlinkSync(filepath)
          reject(new Error(`Failed to download: ${response.statusCode}`))
        }
      })
      .on('error', (err) => {
        file.close()
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
        reject(err)
      })
  })
}

async function fetchAgents() {
  console.log('Fetching agent data...')
  
  return new Promise((resolve, reject) => {
    https.get('https://api.hakush.in/zzz/data/character.json', (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const agents = JSON.parse(data)
          resolve(agents)
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', reject)
  })
}

function extractIconNumber(icon) {
  // Extract number from icon string like "IconRole01" -> "01"
  const match = icon?.match(/IconRole(\d+)/)
  if (match) {
    return match[1].padStart(2, '0')
  }
  return null
}

async function downloadAgentImages(agents) {
  const imagePromises = []
  
  for (const [id, agent] of Object.entries(agents)) {
    if (!agent.icon) {
      console.warn(`No icon property for ${agent.EN || agent.code} (ID: ${id}), skipping...`)
      continue
    }
    
    const iconNumber = extractIconNumber(agent.icon)
    
    if (!iconNumber) {
      console.warn(`Could not extract icon number from ${agent.icon} for ${agent.EN || agent.code}`)
      continue
    }
    
    // Icon image: IconRoleCrop{number}.webp (e.g., IconRoleCrop01.webp)
    const iconUrl = `https://api.hakush.in/zzz/UI/IconRoleCrop${iconNumber}.webp`
    const iconPath = path.join(imagesDir, `IconRoleCrop${iconNumber}.webp`)
    
    // Full body image: IconRole{number}.webp (e.g., IconRole01.webp)
    const fullBodyUrl = `https://api.hakush.in/zzz/UI/IconRole${iconNumber}.webp`
    const fullBodyPath = path.join(imagesDir, `IconRole${iconNumber}.webp`)
    
    console.log(`Downloading images for ${agent.EN || agent.code} (icon: ${agent.icon}, number: ${iconNumber})...`)
    
    // Download icon
    imagePromises.push(
      downloadFile(iconUrl, iconPath).catch((err) => {
        console.warn(`Failed to download icon for ${agent.EN || agent.code}: ${err.message}`)
      })
    )
    
    // Download full body
    imagePromises.push(
      downloadFile(fullBodyUrl, fullBodyPath).catch((err) => {
        console.warn(`Failed to download full body for ${agent.EN || agent.code}: ${err.message}`)
      })
    )
  }
  
  await Promise.all(imagePromises)
  console.log('All images downloaded!')
}

function transformAgentData(agents) {
  const transformed = {}
  
  for (const [id, agent] of Object.entries(agents)) {
    if (!agent.icon) {
      console.warn(`No icon property for ${agent.EN || agent.code} (ID: ${id}), skipping...`)
      continue
    }
    
    const iconNumber = extractIconNumber(agent.icon)
    
    if (!iconNumber) {
      console.warn(`Could not extract icon number from ${agent.icon} for ${agent.EN || agent.code}, skipping...`)
      continue
    }
    
    transformed[id] = {
      id,
      // code: agent.code, // not used
      name: agent.EN,
      rank: agent.rank,
      type: agent.type,
      element: agent.element,
      icon: agent.icon,
      iconUrl: `/images/agents/IconRoleCrop${iconNumber}.webp`,
      bodyUrl: `/images/agents/IconRole${iconNumber}.webp`,
    }
  }
  
  return transformed
}

async function main() {
  try {
    const agents = await fetchAgents()
    console.log(`Found ${Object.keys(agents).length} agents`)
    
    await downloadAgentImages(agents)
    
    const transformed = transformAgentData(agents)
    
    fs.writeFileSync(dataFile, JSON.stringify(transformed, null, 2))
    console.log(`Agent data saved to ${dataFile}`)
    console.log('Done!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
