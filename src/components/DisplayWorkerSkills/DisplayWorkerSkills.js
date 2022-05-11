import React from "react";
import {
  TableHead,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";

const SKILLS_DISABLED_TEXT = "yes";
const SKILLS_ENABLED_TEXT = "-";

class DisplayWorkerSkills extends React.Component {

  constructor(props) {
    super();
    this.props = props;
  }

  render() {
    const getWorkerSkills = (worker) => {
      const skills = {};

      const parseSkills = (skillsAndLevel, disabled) => {
        if (Array.isArray(skillsAndLevel.skills)) {
          skillsAndLevel.skills.forEach((name) => {
            skills[name] = {
              name,
              level: skillsAndLevel.levels
                ? skillsAndLevel.levels[name]
                : undefined,
              disabled: disabled,
            };
          });
        } else {
          console.warn("skills is not an array", skillsAndLevel);
        }
      };

      if (worker.attributes) {
        // current (enabled) skills
        if (worker.attributes.routing) {
          parseSkills(worker.attributes.routing, false);
        }

        // disabled skills 
        if (worker.attributes.disabled_skills) {
          parseSkills(worker.attributes.disabled_skills, true);
        }
      }

      return skills;
    };

    const skills = getWorkerSkills(this.props.worker);

    // console.log("skills - ", JSON.stringify(skills) );

    const allSkills = Object.keys(skills)
      .map((key) => skills[key])
      .sort((a, b) => a.name.localeCompare(b.name));

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Level</TableCell>
            <TableCell>Disabled </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allSkills.map((skill) => (
            <TableRow key={skill.name}>
              <TableCell>{skill.name}</TableCell>
              <TableCell>{skill.level}</TableCell>
              <TableCell>{skill.disabled ? SKILLS_DISABLED_TEXT : SKILLS_ENABLED_TEXT}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

export default DisplayWorkerSkills;
