import { HierarchyNodeType } from '../Constants';
import { IADTModel, IADTTwin, IHierarchyNode } from '../Constants/Interfaces';

export class HierarchyNode implements IHierarchyNode {
    name: string;
    id: string;
    parentNode?: IHierarchyNode;
    nodeData: any;
    nodeType: HierarchyNodeType;
    children?: Record<string, IHierarchyNode>;
    childrenContinuationToken?: string;
    onNodeClick?: (node?: IHierarchyNode) => void;
    isCollapsed?: boolean;
    isSelected?: boolean;
    isLoading?: boolean;

    public static createNodesFromADTModels = (
        models: Array<IADTModel>,
        nodeType: HierarchyNodeType = HierarchyNodeType.Parent,
        newlyAddedModelIds?: Array<string>
    ): Record<string, IHierarchyNode> | Record<string, never> => {
        return models
            ? models
                  .sort((a, b) =>
                      (a.displayName?.en || a.id).localeCompare(
                          b.displayName?.en || b.id,
                          undefined,
                          {
                              numeric: true,
                              sensitivity: 'base'
                          }
                      )
                  )
                  .reduce((p, c: IADTModel) => {
                      p[c.id] = {
                          name: c.displayName?.en || c.id,
                          id: c.id,
                          nodeData: c,
                          nodeType,
                          ...(nodeType === HierarchyNodeType.Parent && {
                              children: {},
                              isCollapsed: true
                          }),
                          isNewlyAdded: newlyAddedModelIds?.includes(c.id)
                      } as IHierarchyNode;
                      return p;
                  }, {})
            : {};
    };

    public static createNodesFromADTTwins = (
        twins: Array<IADTTwin>,
        modelNode: IHierarchyNode
    ): Record<string, IHierarchyNode> | Record<string, never> => {
        return twins
            ? twins
                  .sort((a, b) =>
                      a.$dtId.localeCompare(b.$dtId, undefined, {
                          numeric: true,
                          sensitivity: 'base'
                      })
                  )
                  .reduce((p, c: IADTTwin) => {
                      p[c.$dtId] = {
                          name: c.$dtId,
                          id: c.$dtId,
                          parentNode: modelNode,
                          nodeData: c,
                          nodeType: HierarchyNodeType.Child
                      } as IHierarchyNode;
                      return p;
                  }, {})
            : {};
    };
}
