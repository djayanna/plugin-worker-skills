import React from "react";
import { FormHelperText, Switch } from "@material-ui/core";
import { FlexBox, IconButton } from "@twilio/flex-ui-core";
import { templates, Template } from "@twilio/flex-ui";
import {
  LevelInputAndButtonContainer,
  RightButtonContainer,
  StyledFormControlLabel,
  StyledSkillLevelInput,
  WorkerSkillContainer,
} from "./WorkerSkills.Styles";
import helpers from "../../utils/helpers";

export default class WorkerSkill extends React.Component {
  constructor(props) {
    super();
    this.props = props;
  }

  render() {
    const { skill } = this.props;
    const skillLevelValid = helpers.isSkillLevelValid(skill);

    return (
      <WorkerSkillContainer
        className="Twilio-WorkerSkill"
        vertical
        noGrow
        noShrink
      >
        <FlexBox noShrink>
          <StyledFormControlLabel
            opacity={skill.disabled ? 0.4 : 0}
            control={
              <Switch
                checked={!skill.disabled}
                onChange={this.handleSkillChecked}
                value="checked"
                color="primary"
              />
            }
            label={<Template code={skill.name} />}
          />
          <LevelInputAndButtonContainer vertical noGrow noShrink>
            <FlexBox noGrow noShrink>
              <StyledSkillLevelInput
                disabled={!skill.multivalue}
                error={!skillLevelValid}
                value={
                  skill.level === undefined && !skill.multivalue
                    ? "-"
                    : skill.level || ""
                }
                placeholder={!skill.multivalue ? "" : "-"}
                onChange={this.handleLevelChange}
              />
              <RightButtonContainer>
                <IconButton
                  icon="Close"
                  onClick={this.handleRemoveClick}
                  themeOverride={this.props.theme.WorkerSkills.DeleteButton}
                />
              </RightButtonContainer>
            </FlexBox>
            {!skillLevelValid && (
              <FormHelperText>
                <Template
                   source={templates.WorkerSkillLevelInvalid}
                   min={skill.minimum}
                   max={skill.maximum}
                />
              </FormHelperText>
            )}
          </LevelInputAndButtonContainer>
        </FlexBox>
      </WorkerSkillContainer>
    );
  }

  handleSkillChecked = (event) => {
    const disabled = !event.target.checked;
    this.props.onUpdate({ ...this.props.skill, disabled });
  };

  handleLevelChange = (event) => {
    const levelVal = parseInt(event.target.value, 10);
    this.props.onUpdate({
      ...this.props.skill,
      level: Number.isNaN(levelVal) ? undefined : levelVal,
    });
  };

  handleRemoveClick = () => {
    this.props.onRemove(this.props.skill);
  };
}
