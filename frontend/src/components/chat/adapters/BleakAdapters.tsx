import React from "react";
import type {QuestionComponentProps} from "bleakai";
import {TextQuestion} from "../TextQuestion";
import {RadioQuestion} from "../RadioQuestion";
import {MultiSelectQuestion} from "../MultiSelectQuestion";
import {SliderQuestion} from "../SliderQuestion";

// Adapter for TextQuestion to match BleakAI interface
export const BleakTextQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange
}) => {
  return <TextQuestion question={question} value={value} onChange={onChange} />;
};

// Adapter for RadioQuestion to match BleakAI interface
export const BleakRadioQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  options = [],
  questionIndex = 0
}) => {
  return (
    <RadioQuestion
      question={question}
      value={value}
      onChange={onChange}
      options={options}
      questionIndex={questionIndex}
    />
  );
};

// Adapter for MultiSelectQuestion to match BleakAI interface
export const BleakMultiSelectQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  options = [],
  questionIndex = 0
}) => {
  return (
    <MultiSelectQuestion
      question={question}
      value={value}
      onChange={onChange}
      options={options}
      questionIndex={questionIndex}
    />
  );
};

// Adapter for SliderQuestion to match BleakAI interface
export const BleakSliderQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  options,
  questionIndex = 0
}) => {
  return (
    <SliderQuestion
      question={question}
      value={value}
      onChange={onChange}
      options={options}
      questionIndex={questionIndex}
    />
  );
};
