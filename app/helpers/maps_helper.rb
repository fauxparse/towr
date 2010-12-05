module MapsHelper
  def field(map)
    content_tag :div, :class => :field do
      (0...map.rows).map do |j|
        content_tag :div, :class => :row do
          (0...map.columns).map do |i|
            content_tag :div, :class => "cell #{map.at(i, j).join(" ")}" do
              ""
            end
          end.join.html_safe
        end
      end.join.html_safe
    end
  end
end
