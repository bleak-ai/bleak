# BleakAI Vue.js Example

A simple Vue.js example demonstrating how to use BleakAI to create dynamic AI-powered forms.

## Features

- **Vue 3 Composition API** - Modern Vue.js with TypeScript
- **Dynamic Forms** - AI-generated questions based on user input
- **Component Resolution** - Maps AI element types to Vue components
- **State Management** - Reactive state handling with Vue refs
- **Error Handling** - Graceful error display and recovery
- **Debug Mode** - Built-in debugging to help troubleshoot issues

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up your API key**:

   ```bash
   # Create .env file
   echo "VITE_BLEAK_API_KEY=your-api-key-here" > .env
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Visit `http://localhost:3000`

## Troubleshooting

### Questions Not Showing

If questions aren't appearing, use the **Debug Mode**:

1. Click "Show Debug" button on the main screen
2. Check the debug info panel for:
   - API Key status
   - Session initialization
   - Questions count

### Common Issues

**1. API Key Issues**

- Debug panel shows "API Key: Not set"
- Create `.env` file with `VITE_BLEAK_API_KEY=your-key`
- Restart the dev server after creating `.env`

**2. No Questions Generated**

- Try more complex prompts like "Help me plan a vacation" instead of simple ones
- Check browser console for error messages
- Ensure the BleakAI service is running

**3. TypeScript Errors**

- Run `npm install` to ensure all dependencies are installed
- Check that `env.d.ts` file exists for Vue type declarations

### Debug Console Output

Open browser dev tools (F12) and check the console for:

- "Initializing BleakSession..."
- "Conversation result:" with the API response
- "Setting questions:" when questions are received
- Error messages if something goes wrong

## How It Works

### 1. Component Definitions

The example defines three Vue components for BleakAI:

- **TextInput** - For free-form text responses
- **RadioGroup** - For single choice selection
- **MultiSelect** - For multiple choice selection

### 2. Element Configuration

```typescript
const elementConfig = {
  text: {
    component: TextInput,
    description: "Free-form text input for detailed responses"
  },
  radio: {
    component: RadioGroup,
    description: "Single choice selection from predefined options"
  },
  multi_select: {
    component: MultiSelect,
    description: "Multiple choice selection from available options"
  }
};
```

### 3. Conversation Flow

1. **Start** - User enters a prompt
2. **Questions** - AI generates relevant questions
3. **Answers** - User fills out the dynamic form
4. **Result** - AI provides comprehensive answer

## Usage Examples

Try these prompts that typically generate questions:

- "Help me plan a vacation"
- "I need to buy a laptop"
- "Plan a birthday party for my friend"
- "Help me choose a restaurant"
- "I want to redecorate my living room"

**Note**: Simple prompts like "What's 2+2?" may get direct answers without generating questions.

## File Structure

```
vue-example/
├── BleakAIExample.vue    # Main component with BleakAI logic
├── App.vue               # Root application component
├── main.ts              # Application entry point
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── env.d.ts             # TypeScript declarations for Vue
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Key Vue Concepts Used

- **Composition API** - `setup()`, `ref()`, `computed()`
- **Reactive State** - Vue 3 reactivity system
- **Dynamic Components** - `<component :is="...">` for BleakAI components
- **Template Refs** - `v-model` for form inputs
- **Conditional Rendering** - `v-if` for different states

## Environment Variables

Create a `.env` file:

```bash
# Required: Your BleakAI API key
VITE_BLEAK_API_KEY=your-api-key-here

# Optional: API endpoint (defaults to localhost for development)
VITE_BLEAK_API_URL=http://localhost:8008/bleak
```

**Important**:

- Environment variables in Vite must be prefixed with `VITE_`
- Restart the dev server after creating/modifying `.env`
- The `.env` file should be in the root of the vue example directory

## Component Styling

The example includes CSS classes matching the React version:

- `.question-group` - Container for each question
- `.question-label` - Question text styling
- `.text-input` - Text input field styling
- `.radio-options` / `.checkbox-options` - Option containers
- `.radio-option` / `.checkbox-option` - Individual option styling

## Customization

### Adding New Component Types

1. Define your Vue component:

   ```typescript
   const DatePicker = {
     props: ["text", "value", "onChange"],
     template: `
       <div class="question-group">
         <label class="question-label">{{ text }}</label>
         <input 
           type="date" 
           :value="value" 
           @input="onChange($event.target.value)"
           class="date-input"
         />
       </div>
     `
   };
   ```

2. Add to element configuration:
   ```typescript
   const elementConfig = {
     // ... existing components
     date: {
       component: DatePicker,
       description: "For date selection"
     }
   };
   ```

### Styling

The example includes basic CSS. You can:

- Replace with your design system
- Add CSS frameworks like Tailwind or Bootstrap
- Use Vue component libraries like Vuetify or Quasar

## Production Setup

1. **Build for production**:

   ```bash
   npm run build
   ```

2. **Preview production build**:

   ```bash
   npm run preview
   ```

3. **Deploy** the `dist/` folder to your hosting service

## Next Steps

- **Styling** - Add your design system or CSS framework
- **Validation** - Add form validation for user inputs
- **Persistence** - Save conversation state to localStorage
- **Components** - Add more component types (slider, file upload, etc.)
- **Testing** - Add unit tests for components and logic

## Learning Resources

- [Vue.js Documentation](https://vuejs.org/)
- [BleakAI Documentation](../../docs/getting-started.mdx)
- [TypeScript with Vue](https://vuejs.org/guide/typescript/overview.html)
- [Vite Documentation](https://vitejs.dev/)
