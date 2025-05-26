// import {RadioGroup, RadioGroupItem} from "./ui/radio-group";
// import {Label} from "./ui/label";
// import {type PromptQuestion} from "../api/bleakApi";
// import {Textarea} from "./ui/textarea";

// const SelectOptions = ({data}: {data: PromptQuestion[]}) => {
//   return (
//     <div>
//       {data && data.length > 0 && (
//         <div className="p-4 bg-zinc-700 border border-zinc-600 rounded-xl text-zinc-100 space-y-4">
//           <p className="text-sm font-medium text-zinc-300 mb-3">
//             Please answer the following to help refine the response:
//           </p>

//           {data.map((question, index) => (
//             <div key={`${question.question}-${index}`} className="space-y-2">
//               <Label
//                 htmlFor={
//                   question.type === "text" ? `q-${index}-text` : undefined
//                 }
//                 className="font-medium text-zinc-100"
//               >
//                 {question.question}
//               </Label>
//               {question.type === "radio" && question.options && (
//                 <RadioGroup name={question.question} className="space-y-1">
//                   {question.options.map((option, optIndex) => {
//                     const id = `q-${index}-option-${optIndex}`;
//                     return (
//                       <div key={id} className="flex items-center space-x-2">
//                         <RadioGroupItem value={option} id={id} />
//                         <Label
//                           htmlFor={id}
//                           className="font-normal text-zinc-300"
//                         >
//                           {option}
//                         </Label>
//                       </div>
//                     );
//                   })}
//                 </RadioGroup>
//               )}
//               {question.type === "text" && (
//                 <Textarea
//                   id={`q-${index}-text`}
//                   name={question.question}
//                   placeholder="Your answer..."
//                   className="bg-zinc-800 text-white border-zinc-700 placeholder-zinc-500 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
//                   rows={3}
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SelectOptions;
